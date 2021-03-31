/**
 * Creates cart object
 * @param {Object} oldCart the old cart or an empty object
 *
 * @returns {Array} cart object
 */
function Cart(oldCart) {
  this.aliasCarts = oldCart.aliasCarts || {};
  /**
   * adds to cart
   * @param {Object} item
   *
   * @returns {Array} cart object
   */
  this.add = function (item) {
    let aliasCart = this.aliasCarts[item.alias._id];
    if (!aliasCart) {
      aliasCart = this.aliasCarts[item.alias._id] = {
        items: {},
        totalQty: 0,
        totalPrice: 0,
        alias: item.alias,
      };
    }
    let storedItem = aliasCart.items[item._id];
    if (!storedItem) {
      storedItem = aliasCart.items[item._id] = { item: item, qty: 0, price: 0 };
    }
    storedItem.qty++;
    storedItem.price = parseFloat(storedItem.item.price) * storedItem.qty;
    aliasCart.totalQty++;
    aliasCart.totalPrice += parseFloat(storedItem.item.price);
  };

  this.recalculateTotals = function () {
    const aliases = Object.keys(this.aliasCarts);

    aliases.forEach((alias) => {
      const aliasCart = this.aliasCarts[alias];
      recalculateTotalsAliasCart(aliasCart);
    });
  };

  /**
   * reduce item by one in cart
   * @param {String} itemId
   */
  this.reduceByOne = function (itemId) {
    const aliasId = this.aliasIdFromItemId(itemId);
    if (!aliasId) return;
    this.reduceByOneWithAlias(itemId, aliasId);
  };
  /**
   * reduce item by one in cart
   * @param {String} itemId
   * @param {String} aliasId
   */
  this.reduceByOneWithAlias = function (itemId, aliasId) {
    const aliasCart = this.aliasCarts[aliasId];
    aliasCart.items[itemId].qty--;
    aliasCart.items[itemId].price -= aliasCart.items[itemId].item.price;
    aliasCart.totalQty--;
    aliasCart.totalPrice -= aliasCart.items[itemId].item.price;

    if (aliasCart.items[itemId].qty <= 0) {
      delete aliasCart.items[itemId];
    }
  };

  /**
   * remove item from cart
   * @param {String} itemId
   */
  this.aliasIdFromItemId = (itemId) => {
    const items = [];
    Object.values(this.aliasCarts).forEach((cart) => items.push(Object.values(cart.items)));
    const allItems = items.reduce((a, c) => [...a, ...c], []);
    const item = allItems.find((it) => it.item._id.toString() === itemId.toString());
    if (!item) return null;
    const aliasId = item.item.alias._id;
    return aliasId;
  };
  /**
   * remove item from cart
   * @param {String} itemId
   */
  this.removeItem = function (itemId) {
    const aliasId = this.aliasIdFromItemId(itemId);
    if (!aliasId) return;
    this.removeItemByAlias(itemId, aliasId);
  };
  /**
   * remove item from cart by alias
   * @param {String} itemId
   * @param {String} aliasId
   */
  this.removeItemByAlias = function (itemId, aliasId) {
    const aliasCart = this.aliasCarts[aliasId];
    aliasCart.totalQty -= aliasCart.items[itemId].qty;
    aliasCart.totalPrice -= aliasCart.items[itemId].price;
    delete aliasCart.items[itemId];
  };

  this.clearEmptyCarts = () => {
    const emptyCarts = Object.values(this.aliasCarts).reduce((a, aliasCart) => {
      if (JSON.stringify(aliasCart.items) === '{}') {
        a.push(aliasCart.alias._id);
      }
      return a;
    }, []);
    if (emptyCarts.length)
      emptyCarts.forEach((cart) => {
        delete this.aliasCarts[cart];
      });
  };

  this.generateArray = function generateArray() {
    const arr = [];
    Object.keys(this.aliasCarts).forEach((key) => {
      arr.push(this.aliasCarts[key]);
    });
    return arr;
  };
  /**
   * generate an item array for an alias cart
   * @param {String} alias
   * @returns {Object[]}
   */
  this.generateItemArray = function generateItemArray(alias) {
    return Object.values(this.aliasCarts[alias].items);
  };
  return this;
}
//
const recalculateTotalsAliasCart = function (aliasCart) {
  const items = Object.keys(aliasCart.items);
  const aliasCartCopy = aliasCart;
  items.forEach((item) => {
    aliasCartCopy.items[item].price = aliasCart.items[item].item.price * aliasCart.items[item].qty;
  });
  aliasCartCopy.totalPrice = items.reduce(
    (a, item) => aliasCart.items[item].item.price * aliasCart.items[item].qty + a,
    0
  );
  return aliasCart;
};

module.exports.Cart = Cart;
module.exports.recalculateTotalsAliasCart = recalculateTotalsAliasCart;
