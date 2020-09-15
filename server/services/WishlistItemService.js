const WishlistModel = require('../models/Wishlist.Model');

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
   * to the specified wishlist's "wishlist" array
   * @param {string} wishlistId
   * @param {object} wishlistItem
   *
   *
   * @returns {object} the wishlist item
   */
  async addWishlistItem(wishlistId, wishlistItem) {
    const item = await this.WishlistItemModel.create(wishlistItem);
    item.wishlist = wishlistId;
    await item.save();

    await WishlistModel.findByIdAndUpdate(
      wishlistId,
      {
        $push: {
          wishlists: item._id,
        },
      },
      { new: true, useFindAndModify: false }
    );

    return item;
  }

  /**
   * gets a wishlist item
   *
   * @param {Array.<Sting>} ids the ids of the wishlists
   * @returns {array} an array of wishlist items
   */
  async getWishlistItems(ids) {
    const wishlistItems = await this.WishlistItemModel.find({ _id: { $in: ids } });
    return wishlistItems;
  }

  /**
   * updates the specified wishlist item
   *
   *@param {string} id the wishlist item id
   *@param {object} updates the wishlist item updates
   *
   * @returns {{message: string, success:boolean, updatedItem: object}} success message
   */
  async updateWishlistItem(id, updates) {
    const output = await this.WishlistItemModel.updateOne({ _id: id }, updates);
    let message = 'Something went wrong';
    let success = false;
    let updated = null;
    if (output.nModified) {
      message = 'Successfully updated wishlist item.';
      success = true;
      updated = await this.getWishlistItems([id]);
      updated = updated[0];
    }

    return { message, success, updatedItem: updated };
  }

  /**
   * deletes a wishlist item
   *
   *@param {string} id of id the wishlist item id
   *
   * @returns {{message: string, success: boolean, deletedItem: object}} success message
   */
  async deleteWishlistItem(id) {
    const item = await this.WishlistItemModel.findById(id);
    item.remove();
    return { message: 'Item deleted', success: true, deletedItem: item };
  }
}
module.exports = WishlistItemService;
