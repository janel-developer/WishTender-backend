const { ApplicationError } = require('../lib/Error');
const logger = require('../lib/logger');
const Cart = require('../models/Cart.Model');
const Wishlist = require('../models/Wishlist.Model');
const WishlistItem = require('../models/WishlistItem.Model');

module.exports.addToCart = async (itemId, currentCart) => {
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
module.exports.removeByOne = async (itemId, aliasId) => {
  logger.log('silly', `adding to cart`);
  const cart = new Cart(currentCart || {});
  cart.removeByOne(itemId, aliasId);
  return cart;
};
module.exports.checkout = async (cart) => {
  logger.log('silly', `checking out`);

  let item;
  try {
    item = await WishlistItem.findById(itemId);
  } catch (err) {
    throw new ApplicationError({ itemId }, `Wishlist Item not found: ${itemId}`);
  }
  cart.add(item, itemId);
  return cart;
};
