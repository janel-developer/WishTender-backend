const WishlistModel = require('../models/Wishlist.Model');
const { ApplicationError } = require('../lib/Error');

console.log('wishlistitem', ApplicationError);
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
  async addWishlistItem(wishlistId, wishlistItemValues) {
    let item;
    let wishlist;
    const wishlistItem = wishlistItemValues;
    wishlistItem.wishlist = wishlistId;

    try {
      wishlist = await WishlistModel.findById(wishlistId);
    } catch (err) {
      throw new ApplicationError(
        {
          wishlistItemValues,
          wishlistId,
          err,
        },
        `Unable to add wishlistItem, wishlistId not found: ${err.name}:${err.message}`
      );
    }
    try {
      item = await this.WishlistItemModel.create(wishlistItem);
    } catch (err) {
      throw new ApplicationError(
        {
          wishlistItemValues,
          wishlistId,
          err,
        },
        `Unable to add wishlistItem: ${err.name}: ${err.message}`
      );
    }

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
