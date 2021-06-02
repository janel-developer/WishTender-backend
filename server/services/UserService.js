const ConfirmationEmail = require('../lib/email/ConfirmationEmail');
const { ApplicationError } = require('../lib/Error');
const logger = require('../lib/logger');
const Token = require('../models/Token.Model');
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

      throw new ApplicationError( // custom error object that takes an info object and a message
        {
          user,
          err,
          resMsg,
        },
        `Unable to create user: ${err.name}: ${err.message}`
      );
    }
    try {
      await confirmationEmailService.send(newUser);
    } catch (error) {
      throw new ApplicationError({}, `Couldn't send confirmation email:${error}`);
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
      throw new ApplicationError(
        { userId: id, err },
        `Unable to get user: ${err.name}:${err.message}.`
      );
    }
    return user;
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
      throw new ApplicationError({ id, updates }, 'User not updated.');
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
        { userId, alias, err },
        `Can't add alias. Unable to find user: ${err.name}:${err.message}.`
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
      throw new ApplicationError(
        { userId, aliasId, err },
        `Can't delete alias: ${err.name}:${err.message}.`
      );
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
   *@param {string} id the wishlist item id
   *
   * @returns {object} deleted wishlist
   */
  async hardDeleteUser(id) {
    let user;
    try {
      user = await this.UserModel.findById(id);
    } catch (err) {
      throw new ApplicationError({ id, err }, `Couldn't delete user. Couldn't retrieve user.`);
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
    let itemsRemoved = 0;
    let user;
    try {
      user = await this.UserModel.findById(id)
        .populate({
          path: 'wishlists',
          model: 'Wishlist',
          populate: {
            path: 'wishlistItems',
            model: 'WishlistItem',
          },
        })
        .populate({
          path: 'aliases',
          model: 'Alias',
        })
        .populate({
          path: 'stripeAccountInfo',
          model: 'StripeAccountInfo',
        })
        .exec();

      // const now = new Date();
      // const softDelete = async (resource) => {
      //   const res = resource;
      //   res.deleted = true;
      //   res.deletedAt = now;
      //   await res.save();
      // };

      const toRemove = [
        user,
        user.wishlists[0],
        user.aliases[0],
        user.stripeAccountInfo,
        ...user.wishlists[0].wishlistItems,
      ];

      const success = new Promise((res) => {
        toRemove.forEach(async (item) => {
          const Model = item.constructor;
          // Sample.removeMany({ _id: sampleId }, function (err, res) {});

          await Model.removeOne({ _id: item._id }); // soft delete plugin does it's magic
          itemsRemoved += 1;
          if (itemsRemoved === toRemove.length) res(true);
        });
      });
      return success;
    } catch (err) {
      throw new Error(`Couldn't soft delete user. Something went wrong ${err}`);
    }
  }
}
module.exports = UserService;
