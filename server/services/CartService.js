const { ApplicationError } = require('../lib/Error');
const logger = require('../lib/logger');
const Cart = require('../models/Cart.Model');
const Wishlist = require('../models/Wishlist.Model');
const WishlistItem = require('../models/WishlistItem.Model');

module.exports.addToCart = async (itemId, currentCart) => {
  const cart = new Cart(currentCart || {});

  let item;
  try {
    item = await WishlistItem.findById(itemId);
  } catch (err) {
    throw new ApplicationError({ itemId }, `Wishlist Item not found: ${itemId}`);
  }
  cart.add(item, itemId);
  return cart;
};
module.exports.checkout = async (cart) => {
  let item;
  try {
    item = await WishlistItem.findById(itemId);
  } catch (err) {
    throw new ApplicationError({ itemId }, `Wishlist Item not found: ${itemId}`);
  }
  cart.add(item, itemId);
  return cart;
};
