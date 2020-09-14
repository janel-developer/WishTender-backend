
/**
 * Logic for fetching wishlist items
 */
class WishlistItemService {
    /**
     * Constructor
     * @param {*} WishlistItemModel Mongoose Schema Model
     */
    constructor() {
      this.WishModel = WishModel;
    }

/**
 * creates a wishlist item and adds the id
 * of the item to the specified wishlist
 * @param {string} wishlistId
 * @param {object} wishlistItem
 *
 * @returns {object} the wishlist item
 */
async function addWishlistItem(wishlistId, wishlistItem) {}

/**
 * gets all the wishlist items in the database
 *
 * @returns {array} an array of wishlists
 */
async function getWishlistItems() {}

/**
 * updates the specified wishlist item
 *
 *@param {string} id the wishlist item id
 *@param {object} updates the wishlist item updates
 *
 * @returns {{message: string}} success message
 */
async function updateWishlistItem(id, updates) {}

/**
 * deletes a wishlist item and the refs in the a wishlist
 *
 *@param {string} id of id the wishlist item id
 *
 * @returns {{message: string}} success message
 */
async function deleteWishlistItem(id) {}
}