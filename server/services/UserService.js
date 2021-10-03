const ConfirmationEmail = require('../lib/email/ConfirmationEmail');
const { ApplicationError } = require('../lib/Error');
const logger = require('../lib/logger');
const Token = require('../models/Token.Model');
const csrf = require('csurf');

const OrderModel = require('../models/Order.Model');

const ConfirmationEmailService = require('./ConfirmationEmailService');

const confirmationEmailService = new ConfirmationEmailService();
/**
 * Logic for interacting with the user model
 */
class UserService {
  /**
   * Constructor
   * @param {*} UserModel Mongoose Schema Model
   */
  constructor(UserModel) {
    this.UserModel = UserModel;
  }

  /**
   * creates a user
   * @param {object} user the user properties and values
   *
   *
   * @returns {object} the new user
   */
  async addUser(user) {
    logger.log('silly', 'adding user');
    let newUser;
    try {
      newUser = await this.UserModel.create(user);
    } catch (err) {
      let resMsg = null;
      if (err.code === 11000) {
        resMsg = 'The email you used is already registered';
      }
      // this seems more of a 400 error. ok for now. should be in validations.
      throw new ApplicationError(
        {
          err,
          resMsg,
        },
        `Internal error trying to create user.`
      );
    }
    try {
      await confirmationEmailService.send(newUser);
    } catch (err) {
      throw new ApplicationError(
        { err },
        `Couldn't send confirmation email because of an internal error.`
      );
    }

    return newUser;
  }

  /**
   * gets a user
   *
   * @param {Array.<Sting>} id the id of the user
   * @returns {object} the user
   */
  async getUser(id) {
    let user;
    try {
      user = await this.UserModel.findById(id);
    } catch (err) {
      throw new ApplicationError({ err }, `Internal error getting user.`);
    }
    return user;
  }

  /**
   * gets all users
   *
   * @returns {array} the users
   */
  async getUsers(admin) {
    let users;
    if (!admin) return null; // this sends gifter emails
    try {
      // user = await this.UserModel.find({ email: 'dangerousdashie@gmail.com' })
      //   .populate({
      //     path: 'aliases',
      //     model: 'Alias',
      //   })
      //   .exec();

      const orders = await OrderModel.find({ paid: true });
      users = await this.UserModel.find({})
        .populate({
          path: 'wishlists',
          model: 'Wishlist',
          options: { withDeleted: true },
          populate: {
            path: 'wishlistItems',
            model: 'WishlistItem',
            options: { withDeleted: true },
          },
        })
        .populate({
          path: 'aliases',
          model: 'Alias',
          options: { withDeleted: true },
        })
        .populate({
          path: 'stripeAccountInfo',
          model: 'StripeAccountInfo',
          options: { withDeleted: true },
        })
        .exec();
      users = users.map((user) => {
        const newUser = user.toJSON();
        if (user.aliases && user.aliases[0])
          newUser.orders = orders
            .filter((order) => order.alias.toJSON() === newUser.aliases[0]._id.toJSON())
            .map((order) => order.toJSON({ transform: false }));
        return newUser;
      });
    } catch (err) {
      throw new ApplicationError({ err }, `Internal error users.`);
    }
    return users;
  }

  /**
   * updates the specified user
   *
   *@param {string} id the user id
   *@param {object} updates the user updates
   *
   * @returns {object} updated user
   */
  async updateUser(id, updates) {
    const output = await this.UserModel.updateOne({ _id: id }, updates);

    let updatedUser;
    if (output.nModified) {
      updatedUser = await this.getUser(id);
    } else {
      throw new Error('User not updated.');
    }
    return updatedUser;
  }

  /**
   * adds an alias to a user
   *
   *@param {string} id the user id
   *@param {object} alias the alias object
   *
   * @returns {object} updated alias
   */
  async addAlias(userId, alias) {
    let user;
    try {
      user = await this.UserModel.findById(userId);
    } catch (err) {
      throw new ApplicationError(
        { err },
        `Can't add alias. Unable to find user because of an internal error.`
      );
    }
    user.aliases.push(alias);
    // how to return alias??
    await user.save();

    const newAlias = user.aliases.find((a) => a.aliasName === alias.aliasName);
    return newAlias;
  }

  /**
   * deletes an alias to a user
   *
   *@param {string} userId the user id
   *@param {object} aliasId the alias is
   *
   * @returns {object} deleted alias
   */
  async deleteAlias(userId, aliasId) {
    let user;
    try {
      user = await this.UserModel.findById(userId);
    } catch (err) {
      throw new ApplicationError({ err }, `Can't delete alias because of an internal error.`);
    }
    console.log('alid', aliasId);
    const alias = user.aliases.find((a) => a._id.toString() === aliasId.toString());

    user.aliases.pull(alias);
    await user.save();
    return alias;
  }

  /**
   * deletes a user
   *
   *@param {string} id the user id
   *
   * @returns {object} deleted user
   */
  async hardDeleteUser(id) {
    let user;
    try {
      user = await this.UserModel.findById(id);
    } catch (err) {
      throw new ApplicationError({ err }, `Couldn't delete user. Internal error retrieving user.`);
    }

    await user.remove();

    return user;
  }

  /**
   *  soft deletes a user
   *
   *@param {string} id the wishlist item id
   *
   * @returns {object} deleted wishlist
   */
  async softDeleteUser(id) {
    const result = await this.toggleSoftDeleteUser(id, false);
    return result;
  }

  /**
   *  restores a soft deletes a user
   *
   *@param {string} id the wishlist item id
   *
   * @returns {object} deleted wishlist
   */
  async restoreUser(id) {
    const result = await this.toggleSoftDeleteUser(id, true);
    return result;
  }

  async toggleSoftDeleteUser(id, isRestore) {
    let itemsChanged = 0;
    let user;
    try {
      user = await this.UserModel.findOneWithDeleted({ _id: id })
        .populate({
          path: 'wishlists',
          model: 'Wishlist',
          options: { withDeleted: true },
          populate: {
            path: 'wishlistItems',
            model: 'WishlistItem',
            options: { withDeleted: true },
          },
        })
        .populate({
          path: 'aliases',
          model: 'Alias',
          options: { withDeleted: true },
        })
        .populate({
          path: 'stripeAccountInfo',
          model: 'StripeAccountInfo',
          options: { withDeleted: true },
        })
        .exec();

      let toChange = [
        user,
        user.aliases[0],
        user.wishlists[0],
        ...user.wishlists[0].wishlistItems,
        user.stripeAccountInfo,
      ];
      toChange = toChange.filter((it) => (isRestore ? it.deleted : !it.deleted));
      // eslint-disable-next-line no-restricted-syntax
      for (const item of toChange) {
        try {
          if (isRestore) {
            // eslint-disable-next-line no-await-in-loop
            await item.restore(); // soft delete plug restores
          } else {
            // eslint-disable-next-line no-await-in-loop
            await item.delete(); // soft delete plug restores
          }
          itemsChanged += 1;
        } catch (err) {
          throw new ApplicationError(
            { err },
            `Internal error when trying to ${isRestore ? 'restore' : 'soft delete'} ${
              item.constructor.modelName
            } id:${item._id}.`
          );
        }
      }
      let success;
      if (itemsChanged === toChange.length) success = true;

      return success;
    } catch (err) {
      throw new Error(
        `Couldn't ${isRestore ? 'restore' : 'soft delete'} user. Something went wrong ${err}`
      );
    }
  }
}
module.exports = UserService;
