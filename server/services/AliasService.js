const fs = require('fs');
const UserModel = require('../models/User.Model');
const { ApplicationError } = require('../lib/Error');
const logger = require('../lib/logger');
const { deleteImage } = require('./utils');
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
      throw new ApplicationError(
        { userId, aliasValues, err },
        `Not able to add alias. User Id not found. ${err.message}`
      );
    }

    try {
      newAlias = await this.AliasModel.create(alias);
    } catch (err) {
      throw new ApplicationError(
        { userId, alias, err },
        `Not able to add alias. Alias not able to be created. ${err.message}`
      );
    }

    user.aliases.push({ _id: newAlias._id });
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
      throw new ApplicationError({ id, err }, `Alias not found.`);
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
        .exec();
    } catch (err) {
      throw new ApplicationError({ query, err }, `Alias not found.`);
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
  async updateAlias(id, updates) {
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
      if (Object.keys(updates).includes('profileImage')) {
        deleteImage(oldImageFile);
      }
      return;
    } catch (err) {
      throw new ApplicationError({ id, updates }, `Alias not updated.${err}`);
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
      throw new ApplicationError({ id, err }, `Couldn't delete alias. Alias not found.`);
    }
    await alias.remove();
    return alias;
  }
}

module.exports = AliasService;
