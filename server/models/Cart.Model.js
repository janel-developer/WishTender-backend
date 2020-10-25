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
      aliasCart = this.aliasCarts[item.alias] = { items: {}, totalQty: 0, totalPrice: 0 };
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

  /**
   * reduce item by one in cart
   * @param {String} itemId
   * @param {String} aliasId
   */
  this.reduceByOne = function (itemId, aliasId) {
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
