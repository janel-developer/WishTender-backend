const { MongooseDocument } = require('mongoose');
const { ApplicationError } = require('../lib/Error');
const logger = require('../lib/logger');
const Alias = require('../models/Alias.Model');

/**
 * Logic for Order
 */
class OrderService {
  /**
   * Constructor
   * @param {*} OrderModel Mongoose Schema Model
   */
  constructor(OrderModel) {
    this.OrderModel = OrderModel;
  }

  /**
   * creates an order
   * to the specified user-alias's "alias"
   * @param {MongooseDocument} product wishlistItem
   * @param {string} amountToWishTender
   * @param {string} amountToUser
   * @param {string} processorFee
   * @param {Object} buyerInfo Information about the buyer
   *
   *
   * @returns {MongooseDocument} the order
   */
  async createOrder(
    product,
    amountToWishTender,
    amountToUser,
    processorFee,
    processedBy,
    buyerInfo
  ) {
    const wishlistItemInfo = JSON.parse(JSON.stringify(product));
    let order;
    try {
      order = await this.OrderModel.create({
        buyerInfo,
        wishlistItemInfo,
        amountToWishTender,
        amountToUser,
        processorFee,
        processedBy,
        wishlist: wishlistItemInfo.wishlist,
        alias: wishlistItemInfo.alias,
        user: wishlistItemInfo.user,
      });
    } catch (err) {
      throw new ApplicationError({ product, buyerInfo }, `Not able to add order. ${err.message}`);
    }

    return order;
  }

  /**
   * gets orders by user
   * @param {userId} id the user id
   *
   *
   * @returns {Object[]} the orders
   */
  async getOrdersByUser(userId) {
    let orders;
    try {
      orders = await this.OrderModel.find({ user: userId });
    } catch (err) {
      throw new ApplicationError({ userId, err }, `Orders not found. ${err}`);
    }

    return orders;
  }
}

module.exports = OrderService;
