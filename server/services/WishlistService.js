const UserModel = require('../models/User.Model');
const AliasModel = require('../models/Alias.Model');
const { ApplicationError } = require('../lib/Error');

/**
 * Logic for wishlist
 */
class WishlistService {
  /**
   * Constructor
   * @param {*} WishlistModel Mongoose Schema Model
   */
  constructor(WishlistModel) {
    this.WishlistModel = WishlistModel;
  }

  /**
   * creates a wishlist and adds the id
   * to the specified alias's "wishlist" array
   * @param {string} aliasId
   * @param {object} wishlistValues the values for the wishlist besides user and alias
   *
   *
   * @returns {object} the wishlist
   */
  async addWishlist(aliasId, wishlistValues) {
    let newWishlist;
    let alias;
    const wishlist = wishlistValues;
    wishlist.alias = aliasId;

    try {
      alias = await AliasModel.findById(aliasId);
    } catch (err) {
      throw new ApplicationError(
        { aliasId, wishlistValues },
        `Not able to add wishlist. Alias not found. ${err.message}`
      );
    }
    let user;
    try {
      user = await UserModel.findById(alias.user);
    } catch (err) {
      throw new ApplicationError(
        { aliasId, wishlistValues },
        `Not able to add wishlist. User not found. ${err.message}`
      );
    }
    try {
      newWishlist = await this.WishlistModel.create(wishlist);
    } catch (err) {
      throw new ApplicationError(
        { aliasId, wishlist, err },
        `Not able to add wishlist. Wishlist not able to be created. ${err.message}`
      );
    }

    alias.wishlists.push({ _id: newWishlist._id });
    user.wishlists.push({ _id: newWishlist._id });
    await alias.save();
    await user.save();

    return newWishlist;
  }

  /**
   * gets a wishlist
   * @param {string} id the wishlist id
   *
   *
   * @returns {object} the wishlist
   */
  async getWishlist(id) {
    let wishlist;
    try {
      wishlist = await this.WishlistModel.findOne({ _id: id }).populate('wishlistItems').exec();
      console.log('d');
    } catch (err) {
      throw new ApplicationError({ id, err }, `Wishlist not found.`);
    }

    return wishlist;
  }

  /**
   * update a wishlist
   * @param {string} id the wishlist id to update
   * @param {object} updates the updates to the wishlist {property: value}
   *
   *
   * @returns {object} the updated wishlist
   */
  async updateWishlist(id, updates, deleteImage) {
    // const output = await this.AliasModel.updateOne({ _id: id }, updates);
    try {
      const wishlist = await this.WishlistModel.findOne({ _id: id });
      const oldImageFile = wishlist.coverImage;
      Object.entries(updates).forEach((update) => {
        const field = update[0];
        const val = update[1];
        wishlist[field] = val;
      });
      await wishlist.save();
      if (Object.keys(updates).includes('coverImage') && oldImageFile) {
        await deleteImage(oldImageFile);
      }
      return;
    } catch (err) {
      throw new ApplicationError({}, `Problem updating Wishlist.${err}`);
    }
  }

  /**
   * delete a wishlist
   * @param {string} id the id of the wishlist to delete
   *
   *
   * @returns {object} the deleted wishlist
   */
  async deleteWishlist(id) {
    let wishlist;
    try {
      wishlist = await this.WishlistModel.findById(id);
    } catch (err) {
      throw new ApplicationError({ id, err }, `Couldn't delete wishlist. Wishlist not found.`);
    }
    await wishlist.remove();
    return wishlist;
  }
}

module.exports = WishlistService;
