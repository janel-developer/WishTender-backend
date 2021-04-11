const WishlistModel = require('../models/Wishlist.Model');
const { ApplicationError } = require('../lib/Error');
const { decimalMultiplier } = require('./StripeService');

const ExchangeRatesApiInterface = require('../lib/RatesAPI');

const ratesAPI = new ExchangeRatesApiInterface();
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
   * gets wishlist item that aren't the correct currency
   *
   * @param {Sting} alias alias id
   * @param {Sting} currency uppercase 3 letters
   */
  async wishlistItemsNotCurrency(alias, currency) {
    let wishlistItems;
    try {
      // wishlistItems = await this.WishlistItemModel.find({});
      wishlistItems = await this.WishlistItemModel.find({
        alias,
        currency: { $ne: currency },
      });
    } catch (err) {
      throw new ApplicationError({}, `Unable to get wishlist items: ${err}.`);
    }
    return wishlistItems;
  }

  /**
   * convert wishlist items to correct currency
   *
   * @param {Sting} alias alias id
   * @param {Sting} currency uppercase 3 letters
   * @param {Boolean}  changeValue if true convert the values
   *
   */
  async correctCurrency(alias, currency, changeValue) {
    try {
      let wishlistItems;
      if (changeValue) {
        wishlistItems = await this.WishlistItemModel.find({
          alias,
          currency: { $ne: currency },
        });
        if (!wishlistItems.length) {
          return;
        }
        const exchangeRates = await ratesAPI.getAllExchangeRates(currency);
        await new Promise((res, rej) => {
          let itemsUpdated = 0;
          wishlistItems.forEach(async (item) => {
            const multiplier =
              (1 / exchangeRates[item.currency]) * decimalMultiplier(item.currency, currency);
            item.price *= multiplier;
            item.price = Math.round(item.price);
            item.currency = currency;
            try {
              await item.save();
            } catch (error) {
              throw new ApplicationError({}, `Couldn't update item currency:${console.error}`);
            }
            itemsUpdated += 1;
            if (itemsUpdated === wishlistItems.length) {
              res();
            }
          });
        });
      } else {
        await this.WishlistItemModel.update(
          {
            alias,
            currency: { $ne: currency },
          },
          { $set: { currency } },
          { multi: true }
        );
      }
    } catch (err) {
      throw new ApplicationError({}, `Unable to update currencies: ${err}.`);
    }
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
  async updateWishlistItem(id, updates, imageService) {
    console.log('here12345');
    try {
      const wishlistItem = await this.WishlistItemModel.findOne({ _id: id });
      const oldImageFile = wishlistItem.itemImage;
      Object.entries(updates).forEach((update) => {
        const field = update[0];
        const val = update[1];
        wishlistItem[field] = val;
      });
      await wishlistItem.save();
      if (Object.keys(updates).includes('itemImage') && oldImageFile) {
        await imageService.delete(oldImageFile);
      }
      return;
    } catch (err) {
      throw new ApplicationError({}, `Problem updating Wishlist Item.${err}`);
    }
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
      await item.remove();
    } catch (err) {
      console.log(err);
      throw new ApplicationError({ id, err }, `Couldn't delete wishlist item.${err}`);
    }

    return item;
  }
}
module.exports = WishlistItemService;
