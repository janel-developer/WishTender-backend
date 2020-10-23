const ConfirmationEmail = require('../lib/email/ConfirmationEmail');
const { ApplicationError } = require('../lib/Error');
const logger = require('../lib/logger');
const Token = require('../models/Token.Model');
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
   * @returns {object} the wishlist item
   */
  async addUser(user) {
    logger.log('silly', 'adding user');
    let newUser;
    try {
      newUser = await this.UserModel.create(user);
    } catch (err) {
      throw new ApplicationError( // custom error object that takes an info object and a message
        {
          user,
          err,
        },
        `Unable to create user: ${err.name}: ${err.message}`
      );
    }
    let token;
    try {
      token = await Token.create({ user: newUser._id });
    } catch (err) {
      throw new ApplicationError(
        {
          user,
          err,
        },
        `Unable to create email token: ${err.name}: ${err.message}`
      );
    }

    const confirmationEmail = new ConfirmationEmail(
      user.email,
      `www.wishtender.com/confirmation/${newUser.email}/${token.token}`
    );
    confirmationEmail.send();

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
  async deleteUser(id) {
    let user;
    try {
      user = await this.UserModel.findById(id);
    } catch (err) {
      throw new ApplicationError({ id, err }, `Couldn't delete user. User not found.`);
    }
    await user.remove();
    return user;
  }
}
module.exports = UserService;
