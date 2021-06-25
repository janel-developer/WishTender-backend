const _ = require('lodash');
const { ApplicationError } = require('../lib/Error');
const logger = require('../lib/logger');
const { Cart, recalculateTotalsAliasCart } = require('../models/Cart.Model');
const WishlistItem = require('../models/WishlistItem.Model');
const { currencyInfo } = require('../lib/currencyFormatHelpers');
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
    item = await WishlistItem.findOne({ _id: itemId })
      .populate({
        path: 'alias',
        model: 'Alias',
      })
      .exec();
  } catch (err) {
    throw new ApplicationError({ err }, `Internal error getting WishlistItem.`);
  }
  // shouldn't we validate this before and send 400? also the {status: 400} part isn't utilized atm.
  if (!item) throw new ApplicationError({ status: 400 }, `Item doesn't exist`);

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
        throw new ApplicationError({ err }, `Internal error when trying to find wishlist item.`);
      }
      if (!itemInfo) {
        delete aliasCartCopy.items[itemId];
        modified += 1;
      } else if (+aliasCartCopy.items[itemId].item.price !== +itemInfo.price) {
        aliasCartCopy.items[itemId].item.price = itemInfo.price;
        aliasCartCopy.items[itemId].price = itemInfo.price * aliasCartCopy.items[itemId].qty;
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
  const newCart = cart;
  let modified = 0;
  await new Promise((resolve) => {
    aliases.forEach(async (alias) => {
      const result = await updateAliasCartPrices(cart.aliasCarts[alias]);
      modified += result.modified;
      if (result.modified) {
        newCart.aliasCarts[alias] = result.aliasCart;
      }
      cartsUpdated += 1;
      if (cartsUpdated === aliases.length) resolve();
    });
  });
  return { cart: newCart, modified };
};

/**
 * update alias cart prices
 * @param {Object} aliasCart
 * returns {Object} {aliasCart, modified:{alias,itemsModified:[{old,new]}}
 */
const updateAliasCart = async (aliasCart) => {
  logger.log('silly', `checking item prices in the database and updating alias cart prices`);
  let aliasCartCopy = aliasCart;
  const modified = { alias: aliasCartCopy.alias, itemsModified: [] };
  const itemIds = Object.keys(aliasCart.items);
  // for each item, update the price/
  await new Promise((resolve) => {
    let itemsUpdated = 0;
    // to do below- delete alias cart if not items
    itemIds.forEach(async (itemId) => {
      let itemInfo;
      try {
        itemInfo = await WishlistItem.findById(itemId);
      } catch (err) {
        throw new ApplicationError(
          { err },
          `Internal error when trying to find wishlist item to update cart prices.`
        );
      }
      const old = aliasCartCopy.items[itemId].item;
      if (!itemInfo) {
        aliasCartCopy.totalQty -= aliasCartCopy.items[itemId].qty;
        aliasCartCopy.totalPrice -=
          aliasCartCopy.items[itemId].item.price * aliasCartCopy.items[itemId].qty;
        delete aliasCartCopy.items[itemId];
        modified.itemsModified.push({ item: old, new: null });
        if (!aliasCartCopy.items.length) aliasCartCopy = {};
      } else {
        if (+aliasCartCopy.items[itemId].item.price !== +itemInfo.price) {
          aliasCartCopy.items[itemId].item.price = itemInfo.price;
          aliasCartCopy.items[itemId].price = itemInfo.price * aliasCartCopy.items[itemId].qty;
          modified.itemsModified.push({ item: old, new: aliasCartCopy.items[itemId].item });
        }
        const properties = ['currency', 'itemImage', 'itemName'];
        const propChanged = properties.reduce(
          (a, c) => (aliasCartCopy.items[itemId].item[c] !== itemInfo[c] ? true : a),
          false
        );
        if (itemInfo && propChanged) {
          properties.forEach((property) => {
            if (aliasCartCopy.items[itemId].item[property] !== itemInfo[property]) {
              aliasCartCopy.items[itemId].item[property] = itemInfo[property];
            }
          });
          modified.itemsModified.push({ item: old, new: aliasCartCopy.items[itemId].item });
        }
      }

      itemsUpdated += 1;
      if (itemsUpdated === itemIds.length) resolve();
    });
  });

  if (Object.keys(aliasCartCopy).length) recalculateTotalsAliasCart(aliasCartCopy);
  return { aliasCart: aliasCartCopy, modified };
};

const updateCart = async (cart) => {
  const aliases = Object.keys(cart.aliasCarts);
  let cartsUpdated = 0;
  const newCart = cart;
  const cartsModified = [];
  await new Promise((resolve) => {
    aliases.forEach(async (alias) => {
      if (Object.keys(cart.aliasCarts[alias]).length) {
        const result = await updateAliasCart(cart.aliasCarts[alias]);
        cartsModified.push(result.modified);
        if (result.modified.itemsModified.length) {
          if (Object.keys(result.aliasCart).length) {
            newCart.aliasCarts[alias] = result.aliasCart;
          } else {
            delete newCart.aliasCarts[alias];
          }
        }
      }
      cartsUpdated += 1;
      if (cartsUpdated === aliases.length) resolve();
    });
  });
  return { ...newCart, cartsModified };
};

module.exports.reduceByOne = (currentCart, itemId, aliasId) => {
  logger.log('silly', `reducing 1 from cart`);
  const cart = new Cart(currentCart);
  cart.reduceByOne(itemId, aliasId);
  cart.clearEmptyCarts();
  return cart;
};
module.exports.removeItem = (currentCart, itemId, aliasId) => {
  logger.log('silly', `removing item from cart`);
  const cart = new Cart(currentCart);
  cart.removeItem(itemId, aliasId);
  cart.clearEmptyCarts();
  return cart;
};

/**
 * update alias cart prices
 * @param {Object} aliasCart
 * @param {Object} exchangeRate
 * returns {Object} {aliasCart, modified}
 */
module.exports.convert = (aliasCart, exchangeRate, toCurrency, decimalMultiplierSettleToPres) => {
  logger.log('silly', `convert alias cart`);
  const aliasCartCopy = _.cloneDeep(aliasCart);
  aliasCartCopy.convertedTo = toCurrency;

  const itemIds = Object.keys(aliasCartCopy.items);
  // for each item, update the price
  itemIds.forEach(async (itemId) => {
    const convertedPrice = Math.round(
      aliasCartCopy.items[itemId].item.price * exchangeRate * decimalMultiplierSettleToPres
    );
    aliasCartCopy.items[itemId].item.price = convertedPrice;
    aliasCartCopy.items[itemId].item.convertedTo = toCurrency;
    aliasCartCopy.items[itemId].price = convertedPrice * aliasCartCopy.items[itemId].qty;
  });
  recalculateTotalsAliasCart(aliasCartCopy);
  return aliasCartCopy;
};
module.exports.toSmallestUnit = (aliasCart, decimalPlaces) => {
  logger.log('silly', `convert alias cart`);
  const aliasCartCopy = _.cloneDeep(aliasCart);
  const itemIds = Object.keys(aliasCartCopy.items);
  // for each item, update the price
  itemIds.forEach(async (itemId) => {
    aliasCartCopy.items[itemId].item.price *= 10 ** decimalPlaces;
    aliasCartCopy.items[itemId].price *= 10 ** decimalPlaces;
  });
  recalculateTotalsAliasCart(aliasCartCopy);
  return aliasCartCopy;
};

// cart should change when:
// a wisher updates a price,
// an alias, item, or wishlist is deleted,
// the client changes sessions to another currency ? if we decide to store the currenct in the cart

module.exports.addToCart = addToCart;
module.exports.updateCartPrices = updateCartPrices;
module.exports.updateCart = updateCart;
module.exports.updateAliasCartPrices = updateAliasCartPrices;
module.exports.updateAliasCart = updateAliasCart;
