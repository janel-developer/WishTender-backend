const express = require('express');
const logger = require('../lib/logger');
const { ApplicationError } = require('../lib/Error');
const OrderModel = require('../models/Order.Model');
const OrderService = require('../services/OrderService');

const orderService = new OrderService(OrderModel);
const orderRoutes = express.Router();
const ThankYouEmail = require('../lib/email/ThankYouEmail');
const { readableHighWaterMark } = require('../lib/logger');

module.exports = () => {
  orderRoutes.get('/:alias', async (req, res, next) => {
    logger.log('silly', 'getting orders by alias');
    const orders = await orderService.getCompletedOrdersByAlias(req.params.alias);
    console.log(orders);
    res.send(orders);
  });
  orderRoutes.post(
    '/reply/:id',
    async (req, res, next) => {
      if (!req.user) return res.status(401).send('No user logged in.');
      try {
        req.order = await orderService.getOrder({ _id: req.params.id });
        if (req.user.aliases[0].toString() !== req.order.alias.toString())
          return res.status(401).send("User doesn't have permission.");
      } catch (err) {
        return next(new ApplicationError({}, `Couldn't reply to tender ${err}`));
      }
      return next();
    },
    async (req, res, next) => {
      if (req.order.noteToTender)
        return res.status(409).send({ message: 'Note to tender already sent.' });
      return next();
    },
    async (req, res, next) => {
      logger.log('silly', 'replying to tender');
      const { message } = req.body;
      try {
        const tenderEmail = req.order.buyerInfo.email;
        const { alias } = req.order.cart;
        const thankYouEmail = new ThankYouEmail(
          tenderEmail,
          alias.aliasName,
          `http://localhost:4000/${alias.handle}`,
          message
        );

        const info = await thankYouEmail.sendSync().then((inf) => inf);
        if (info) {
          req.order.noteToTender = message;
          req.order.save();
        }
      } catch (err) {
        return next(new ApplicationError({}, `Couldn't reply to tender ${err}`));
      }
      return res.status(200).send({ messageSent: message });
    }
  );
  return orderRoutes;
};
