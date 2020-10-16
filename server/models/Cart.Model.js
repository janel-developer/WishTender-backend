/**
 * Creates cart object
 * @param {Object} oldCart the old cart or an empty object
 *
 * @returns {Array} cart object
 */
function Cart(oldCart) {
  this.items = oldCart.items || {};
  this.totalQty = oldCart.totalQty || 0;
  this.totalPrice = parseFloat(oldCart.totalPrice) || 0;

  /**
   * adds to cart
   * @param {Object} item
   * @param {String} id
   *
   * @returns {Array} cart object
   */
  this.add = function (item, id) {
    var storedItem = this.items[id];
    if (!storedItem) {
      storedItem = this.items[id] = { item: item, qty: 0, price: 0 };
    }
    storedItem.qty++;
    storedItem.price = parseFloat(storedItem.item.price) * storedItem.qty;
    this.totalQty++;
    this.totalPrice += parseFloat(storedItem.item.price);
  };

  this.reduceByOne = function (id) {
    this.items[id].qty--;
    this.items[id].price -= this.items[id].item.price;
    this.totalQty--;
    this.totalPrice -= this.items[id].item.price;

    if (this.items[id].qty <= 0) {
      delete this.items[id];
    }
  };

  this.removeItem = function (id) {
    this.totalQty -= this.items[id].qty;
    this.totalPrice -= this.items[id].price;
    delete this.items[id];
  };

  this.generateArray = function generateArray() {
    const arr = [];
    Object.keys(this.items).forEach((key) => {
      arr.push(this.items[key]);
    });
    return arr;
  };
  return this;
}

module.exports = Cart;
