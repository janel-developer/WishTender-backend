const UserModel = require('../models/User.Model');
const { ApplicationError } = require('../lib/Error');
const logger = require('../lib/logger');
/**
 * Logic for Alias
 */
class AliasService {
  /**
   * Constructor
   * @param {*} AliasModel Mongoose Schema Model
   */
  constructor(AliasModel) {
    this.AliasModel = AliasModel;
  }

  /**
   * creates an alias and adds the id
   * to the specified user-alias's "alias"
   * @param {string} userId
   * @param {object} aliasValues the values for the alias besides user and alias
   *
   *
   * @returns {object} the alias
   */
  async addAlias(userId, aliasValues) {
    let newAlias;
    let user;
    const alias = aliasValues;
    alias.user = userId;
    try {
      user = await UserModel.findById(userId);
    } catch (err) {
      throw new ApplicationError({ err }, `Not able to add alias. Internal error finding user.`);
    }

    try {
      newAlias = await this.AliasModel.create(alias);
    } catch (err) {
      throw new ApplicationError(
        { err },
        `Not able to add alias. Alias not able to be created because of an internal error.`
      );
    }

    user.aliases.push({ _id: newAlias._id });
    user.currency = aliasValues.currency;
    user.country = aliasValues.country;
    await user.save();

    return newAlias;
  }

  /**
   * gets an alias by id
   * @param {string} id the alias id
   *
   * @returns {object} the alias
   */
  async getAliasById(id) {
    let alias;
    try {
      alias = await this.AliasModel.findById(id);
    } catch (err) {
      throw new ApplicationError({ err }, `Internal error when trying to find alias.`);
    }

    return alias;
  }

  /**
   * gets an alias
   * @param {object} query the query
   *
   * @returns {object} the alias
   */
  async getAlias(query) {
    let alias;
    try {
      alias = await this.AliasModel.findOne(query)
        .populate({
          path: 'wishlists',
          model: 'Wishlist',
          populate: {
            path: 'wishlistItems',
            model: 'WishlistItem',
          },
        })
        .populate({
          path: 'user',
          model: 'User',
          populate: {
            path: 'stripeAccountInfo',
            model: 'StripeAccountInfo',
          },
        })
        .exec();
    } catch (err) {
      throw new ApplicationError({ err }, `Internal error when trying to find alias.`);
    }
    return alias;
  }

  /**
   * update an alias
   * @param {string} id the alias id to update
   * @param {object} updates the updates to the alias {property: value}
   *
   *
   * @returns {object} the updated alias
   */
  async updateAlias(id, updates, imageService) {
    // const output = await this.AliasModel.updateOne({ _id: id }, updates);
    try {
      const alias = await this.AliasModel.findOne({ _id: id });
      const oldImageFile = alias.profileImage;
      Object.entries(updates).forEach((update) => {
        const field = update[0];
        const val = update[1];
        alias[field] = val;
      });
      await alias.save();
      if (Object.keys(updates).includes('profileImage') && oldImageFile) {
        imageService.delete(oldImageFile);
      }
      return;
    } catch (err) {
      throw new ApplicationError({ err }, `Alias not updated because of an internal error.`);
    }
  }

  /**
   * delete an alias
   * @param {string} id the id of the alias to delete
   *
   *
   * @returns {object} the deleted alias
   */
  async deleteAlias(id) {
    let alias;
    try {
      alias = await this.AliasModel.findById(id);
    } catch (err) {
      throw new ApplicationError(
        { err },
        `Couldn't delete alias. Internal error when trying to find alias.`
      );
    }
    await alias.remove();
    return alias;
  }
}

module.exports = AliasService;
