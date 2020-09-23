const { ApplicationError } = require('../lib/Error');
/**
 * Logic for fetching wishlist items
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
   * @returns {object} updated user
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
