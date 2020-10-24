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

  /**
   *Returns true if th user got an order in the last 30 days
   * @param {userId} id the user id
   *
   *
   * @returns {boolean} did get order in the last 30 days
   */
  async didGetOrderLast30Days(userId) {
    let month = new Date();
    const days = 30;
    const priorByDays = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    let orders;
    try {
      orders = await this.OrderModel.find({
        processedBy: userId,
      });
      const orders2 = await this.OrderModel.find({});
      console.log('orders', JSON.stringify(orders), userId);
      // console.log('all orders', orders2);
      // orders = await this.OrderModel.find({
      //   user: userId,
      //   createdAt: { $gte: priorByDays },
      // });
    } catch (err) {
      throw new ApplicationError({ userId, err }, `Orders not found. ${err}`);
    }

    return !!orders.length;
  }
}

module.exports = OrderService;
