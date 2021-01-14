const WishlistModel = require('../models/Wishlist.Model');
const { createCroppedImage } = require('../lib/canvas');
const { ApplicationError } = require('../lib/Error');
const wishlistItems = require('../routes/wishlistItems');
const { deleteImage } = require('./utils');

/**
 * Logic for fetching wishlist items
 */
class WishlistItemService {
  /**
   * Constructor
   * @param {*} WishlistItemModel Mongoose Schema Model
   */
  constructor(WishlistItemModel) {
    this.WishlistItemModel = WishlistItemModel;
  }

  /**
   * creates a wishlist item and adds the id
   * to the specified wishlist's "wishlistItems" array
   * @param {string} wishlistId
   * @param {object} wishlistItemValues the wishlist item values except the wishlist id
   *
   *
   * @returns {object} the wishlist item
   */
  async addWishlistItem(wishlistItemValues) {
    let item;
    let wishlist;
    const wishlistItem = wishlistItemValues;

    try {
      wishlist = await WishlistModel.findById(wishlistItem.wishlist);
    } catch (err) {
      throw new ApplicationError(
        {
          wishlistItemValues,
          err,
        },
        `Unable to add wishlistItem, wishlistId not found: ${err.name}:${err.message}`
      );
    }

    wishlistItem.user = wishlist.user;
    wishlistItem.alias = wishlist.alias;

    try {
      item = await this.WishlistItemModel.create(wishlistItem);
    } catch (err) {
      throw new ApplicationError(
        {
          wishlistItemValues,
          err,
        },
        `Unable to add wishlistItem: ${err.name}: ${err.message}`
      );
    }
    if (!wishlist.wishlistItems) wishlist.wishlistItems = [];
    wishlist.wishlistItems.push(item._id);
    await wishlist.save();

    return item;
  }

  /**
   * gets wishlists item
   *
   * @param {Array.<Sting>} ids the ids of the wishlists
   * @returns {array} an array of wishlist items
   */
  async getWishlistItems(ids) {
    let wishlistItems;
    try {
      wishlistItems = await this.WishlistItemModel.find({ _id: { $in: ids } });
    } catch (err) {
      throw new ApplicationError(
        { wishlistIds: ids, err },
        `Unable to get wishlist items: ${err.name}:${err.message}.
        WishlistIds: ${ids}`
      );
    }
    return wishlistItems;
  }

  /**
   * gets a wishlistItem
   * @param {string} id the wishlistItem id
   *
   *
   * @returns {object} the wishlistItem
   */
  async getWishlistItem(id) {
    let wishlistItem;
    try {
      wishlistItem = await this.WishlistItemModel.findById(id);
    } catch (err) {
      throw new ApplicationError({ id, err }, `WishlistItem not found.`);
    }

    return wishlistItem;
  }

  /**
   * updates the specified wishlist item
   *
   *@param {string} id the wishlist item id
   *@param {object} updates the wishlist item updates
   *
   * @returns {updatedItem: object} updated wishlist
   */
  async updateWishlistItem(id, updates) {
    const output = await this.WishlistItemModel.updateOne({ _id: id }, updates);
    let updatedItem;
    if (output.nModified) {
      updatedItem = await this.getWishlistItems([id]);
      [updatedItem] = updatedItem;
    } else {
      throw new ApplicationError(
        { id, updates },
        `WishlistItem not updated. Updates: ${JSON.stringify(updates)}`
      );
    }

    return updatedItem;
  }

  /**
   * deletes a wishlist item
   *
   *@param {string} id the wishlist item id
   *
   * @returns {object} deleted wishlist
   */
  async deleteWishlistItem(id) {
    let item;
    try {
      item = await this.WishlistItemModel.findById(id);
    } catch (err) {
      throw new ApplicationError({ id, err }, `Couldn't delete wishlist item. Item not found.`);
    }
    try {
      const oldImageFile = item.itemImage;
      await item.remove();
      deleteImage(oldImageFile);
    } catch (err) {
      throw new ApplicationError({ id, err }, `Couldn't delete wishlist item.${err}`);
    }

    return item;
  }
}
module.exports = WishlistItemService;
