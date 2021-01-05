const express = require('express');
const logger = require('../lib/logger');
const { ApplicationError } = require('../lib/Error');
const OrderModel = require('../models/Order.Model');
const OrderService = require('../services/OrderService');
const orderService = new OrderService(OrderModel);
const orderRoutes = express.Router();

module.exports = () => {
  orderRoutes.get('/', async (req, res, next) => {
    //clear cart
    const { query } = req;
    if (query.success) {
      const sess = await stripe.checkout.sessions.retrieve(query.session_id);
      // confirm order
      // delete cart
      res.redirect(301, 'http://localhost:3000/order?success=true');
    } else {
      //don't delete cart
      //delete order with session id
      // should this throw an error?
      res.redirect(301, 'http://localhost:3000/order?success=false');
    }
  });

  orderRoutes.post('/', async (req, res, next) => {
    //clear cart
    logger.log('silly', 'creating order');
    const order = await orderService.createOrder(req.body);
    console.log(order);
    res.send(req.body);
  });
};
