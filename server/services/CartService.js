const { ApplicationError } = require('../lib/Error');
const logger = require('../lib/logger');
const { Cart, recalculateTotalsAliasCart } = require('../models/Cart.Model');
const WishlistItem = require('../models/WishlistItem.Model');
/**
 * add to cart
 * @param {*} itemId
 * @param {*} currentCart
 */
const addToCart = async (itemId, currentCart) => {
  logger.log('silly', `adding to cart`);
  const cart = new Cart(currentCart || {});

  let item;
  try {
    item = await WishlistItem.findById(itemId);
  } catch (err) {
    throw new ApplicationError({ itemId }, `Wishlist Item not found: ${itemId}`);
  }
  cart.add(item);
  return cart;
};

/**
 * update alias cart prices
 * @param {Object} aliasCart
 * returns {Object} {aliasCart, modified}
 */
const updateAliasCartPrices = async (aliasCart) => {
  logger.log('silly', `checking item prices in the database and updating alias cart prices`);
  const aliasCartCopy = aliasCart;
  let modified = 0;
  const itemIds = Object.keys(aliasCart.items);
  // for each item, update the price
  await new Promise((resolve) => {
    let itemsUpdated = 0;
    itemIds.forEach(async (itemId) => {
      let itemInfo;
      try {
        itemInfo = await WishlistItem.findById(itemId);
      } catch (err) {
        throw new ApplicationError(
          { itemId },
          `Wishlist Item not found when updating cart prices: ${itemId}`
        );
      }
      if (aliasCartCopy.items[itemId].price !== itemInfo.price) {
        aliasCartCopy.items[itemId].price = itemInfo.price;
        modified += 1;
      }
      itemsUpdated += 1;
      if (itemsUpdated === itemIds.length) resolve();
    });
  });
  recalculateTotalsAliasCart(aliasCartCopy);
  return { aliasCart: aliasCartCopy, modified };
};

const updateCartPrices = async (cart) => {
  const aliases = Object.keys(cart.aliasCarts);
  let cartsUpdated = 0;
  await new Promise((resolve) => {
    aliases.forEach(async (alias) => {
      await updateAliasCartPrices(cart.aliases[alias]);
      cartsUpdated += 1;
      if (cartsUpdated === aliases.length) resolve();
    });
    return cart;
  });
};

module.exports.reduceByOne = (currentCart, itemId, aliasId) => {
  logger.log('silly', `reducing 1 from cart`);
  const cart = new Cart(currentCart);
  cart.reduceByOne(itemId, aliasId);
  return cart;
};
module.exports.removeItem = (currentCart, itemId, aliasId) => {
  logger.log('silly', `removing item from cart`);
  const cart = new Cart(currentCart);
  cart.removeItem(itemId, aliasId);
  return cart;
};

// cart should change when:
// a wisher updates a price,
// an alias, item, or wishlist is deleted,
// the client changes sessions to another currency ? if we decide to store the currenct in the cart

module.exports.addToCart = addToCart;
module.exports.updateCart = updateCartPrices;
module.exports.updateAliasCartPrices = updateAliasCartPrices;
