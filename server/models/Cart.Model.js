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
    let aliasCart = this.aliasCarts[item.alias];
    if (!aliasCart) {
      // eslint-disable-next-line no-multi-assign
      aliasCart = this.aliasCarts[item.alias] = {
        items: {},
        get totalQty() {
          const keys = Object.keys(this.items);
          const total = keys.reduce((a, c) => this.items[c].qty + a, 0);
          return total;
        },
        get totalPrice() {
          const keys = Object.keys(this.items);
          const total = keys.reduce((a, c) => this.items[c].item.price * this.items[c].qty + a, 0);
          return total;
        },
        alias: item.alias,
        user: item.user,
      };
    }
    let storedItem = aliasCart.items[item._id];
    if (!storedItem) {
      storedItem = aliasCart.items[item._id] = {
        item: item,
        qty: 0,
        get price() {
          return this.item.price * this.qty;
        },
      };
    }
    storedItem.qty++;
    storedItem.price = parseFloat(storedItem.item.price) * storedItem.qty;
  };

  /**
   * reduce item by one in cart
   * @param {String} itemId
   * @param {String} aliasId
   */
  this.reduceByOne = function (itemId, aliasId) {
    const aliasCart = this.aliasCarts[aliasId];
    aliasCart.items[itemId].qty--;
    if (aliasCart.items[itemId].qty <= 0) {
      delete aliasCart.items[itemId];
    }
  };

  /**
   * remove item from cart
   * @param {String} itemId
   * @param {String} aliasId
   */
  this.removeItem = function (itemId, aliasId) {
    const aliasCart = this.aliasCarts[aliasId];
    aliasCart.totalQty -= aliasCart.items[itemId].qty;
    aliasCart.totalPrice -= aliasCart.items[itemId].price;
    delete aliasCart.items[itemId];
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

module.exports = Cart;
