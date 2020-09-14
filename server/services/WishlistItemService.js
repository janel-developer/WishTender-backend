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

  // /**
  //  * gets all the wishlist items in the database
  //  *
  //  * @param {string} wishlistId the id of the wishlist
  //  * @returns {array} an array of wishlist items
  //  */
  // async function getWishlistItems(wishlistId) {

  // }

  // /**
  //  * updates the specified wishlist item
  //  *
  //  *@param {string} id the wishlist item id
  //  *@param {object} updates the wishlist item updates
  //  *
  //  * @returns {{message: string}} success message
  //  */
  // async function updateWishlistItem(id, updates) {}

  // /**
  //  * deletes a wishlist item and the refs in the a wishlist
  //  *
  //  *@param {string} id of id the wishlist item id
  //  *
  //  * @returns {{message: string}} success message
  //  */
  // async function deleteWishlistItem(id) {}
}
module.exports = WishlistItemService;
