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
   * @param {Object} order order object {buyerInfo, payment, wishlistItems, processedBy, alias}
   *
   *
   * @returns {MongooseDocument} the order
   */
  async createOrder(order) {
    let newOrder;
    try {
      newOrder = await this.OrderModel.create(order);
    } catch (err) {
      throw new ApplicationError({}, `Not able to add order. ${err.message}`);
    }

    return newOrder;
  }

  /**
   * update order
   * @param {Object} query
   * @param {Object} updates
   *
   */
  async updateOrder(query, updates) {
    let orders;
    try {
      orders = await this.OrderModel.update(query, updates);
    } catch (err) {
      throw new ApplicationError({}, `Couldn't update order. ${err}`);
    }

    return orders;
  }

  /**
   * delete order
   * @param {Object} query
   *
   */
  async deleteOrder(query) {
    let orders;
    try {
      orders = await this.OrderModel.deleteOne(query);
    } catch (err) {
      throw new ApplicationError({}, `Couldn't delete order. ${err}`);
    }

    return orders;
  }

  /**
   * gets orders by alias
   * @param {aliasId} id the user id
   *
   *
   * @returns {Object[]} the orders
   */
  async getOrdersByAlias(aliasId) {
    let orders;
    try {
      orders = await this.OrderModel.find({ alias: aliasId });
    } catch (err) {
      throw new ApplicationError({ aliasId, err }, `Orders not found. ${err}`);
    }

    return orders;
  }

  /**
   * gets completed orders by alias
   * @param {aliasId} id the user id
   *
   *
   * @returns {Object[]} the orders
   */
  async getCompletedOrdersByAlias(aliasId) {
    let orders;
    try {
      orders = await this.OrderModel.find({ alias: aliasId, paid: true });
    } catch (err) {
      throw new ApplicationError({ aliasId, err }, `Orders not found. ${err}`);
    }

    return orders;
  }

  /**
   * gets order
   * @param {Object} query
   *
   * @returns {Object} the order
   */
  async getOrder(query) {
    let orders;
    try {
      orders = await this.OrderModel.findOne(query);
    } catch (err) {
      throw new ApplicationError({}, `Orders not found. ${err}`);
    }

    return orders;
  }
}

module.exports = OrderService;
