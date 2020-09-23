const WishlistModel = require('../models/Wishlist.Model');
const { ApplicationError } = require('../lib/Error');
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
   * @param {object} wishlistItem
   *
   *
   * @returns {object} the wishlist item
   */
  async addWishlistItem(wishlistId, wishlistItem) {
    let item;
    let wishlist;
    try {
      item = await this.WishlistItemModel.create(wishlistItem);
    } catch (err) {
      throw new ApplicationError(
        {
          wishlistItem,
          wishlistId,
          err,
        },
        `Unable to add wishlistItem: ${err.name}: ${err.message}`
      );
    }
    try {
      wishlist = await WishlistModel.findById(wishlistId);
    } catch (err) {
      throw new ApplicationError(
        {
          wishlistItem,
          wishlistId,
          err,
        },
        `Unable to add wishlistItem, wishlistId not found: ${err.name}:${err.message}`
      );
    }
    item.wishlist = wishlistId;
    await item.save();

    wishlist.wishlistItems.push(item._id);

    await wishlist.save();
    return item;
  }

  /**
   * gets a wishlist item
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
      throw new ApplicationError({ id, updates }, 'WishlistItem not updated.');
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
    await item.remove();
    return item;
  }
}
module.exports = WishlistItemService;
