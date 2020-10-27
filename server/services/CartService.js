const { ApplicationError } = require('../lib/Error');
const logger = require('../lib/logger');
const Cart = require('../models/Cart.Model');
const Wishlist = require('../models/Wishlist.Model');
const WishlistItem = require('../models/WishlistItem.Model');

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
const updateAliasCart = async (aliasCart) => {
  logger.log('silly', `updating item prices in alias cart`);
  const items = Object.keys(aliasCart.items);
  // for each item, get the price
  try {
    item = await WishlistItem.findById(itemId);
  } catch (err) {
    throw new ApplicationError({ itemId }, `Wishlist Item not found: ${itemId}`);
  }
  cart.add(item);
  return cart;
};
const updateCart = async (cart) => {
  const aliases = Object.keys(cart.aliasCarts);
  let cartsUpdated = 0;
  await new Promise((resolve) => {
    aliases.forEach(async (alias) => {
      await updateAliasCart(cart.aliases[alias]);
      cartsUpdated += 1;
      if (cartsUpdated === aliases.length) resolve();
    });
    return cart;
  });
};

module.exports.removeByOne = async (currentCart, itemId, aliasId) => {
  logger.log('silly', `adding to cart`);
  currentCart.removeByOne(itemId, aliasId);
  return currentCart;
};

// cart should change when:
// a wisher updates a price,
// an alias, item, or wishlist is deleted,
// the client changes sessions to another currency ? if we decide to store the currenct in the cart

module.exports.addToCart = addToCart;
module.exports.updateCart = updateCart;
module.exports.updateAliasCart = updateAliasCart;
