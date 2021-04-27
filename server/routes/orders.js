const express = require('express');
const logger = require('../lib/logger');
const { ApplicationError } = require('../lib/Error');
const OrderModel = require('../models/Order.Model');
const OrderService = require('../services/OrderService');

const orderService = new OrderService(OrderModel);
const orderRoutes = express.Router();
const ThankYouEmail = require('../lib/email/ThankYouEmail');

module.exports = () => {
  orderRoutes.get('/:alias', async (req, res, next) => {
    logger.log('silly', 'getting orders by alias');
    const orders = await orderService.getCompletedOrdersByAlias(req.params.alias);

    const restructuredOrders = orders.map((order) => ({
      _id: order._id,
      gifts: Object.values(order.cart.items),
      alias: order.toJSON().cart.alias,
      tender: {
        amount: order.toJSON().cart.totalPrice,
        currency: order.cart.alias.currency,
        afterConversion: order.toJSON().convertedCart
          ? order.toJSON().cashFlow.toConnect.amount
          : null,
      },
      noteToWisher: order.noteToWisher,
      fromLine: order.buyerInfo.fromLine,
      notToTender: order.noteToTender,
      paidOn: order.paidOn,
    }));
    res.send(restructuredOrders);
  });
  orderRoutes.get(
    '/new/:alias',
    async (req, res, next) => {
      if (!req.user) return res.status(401).send('No user logged in.');
      return next();
    },
    async (req, res, next) => {
      logger.log('silly', 'getting new orders by alias');
      const newOrders = await orderService.getNewOrdersByAlias({ _id: req.params.alias });
      res.status(200).send(newOrders);
    }
  );
  orderRoutes.patch(
    '/seen/:id',
    async (req, res, next) => {
      if (!req.user) return res.status(401).send('No user logged in.');
      try {
        req.order = await orderService.getOrder({ _id: req.params.id });
        if (req.user.aliases[0].toString() !== req.order.alias.toString())
          return res.status(403).send("User doesn't have permission.");
      } catch (err) {
        return next(new ApplicationError({}, `Couldn't mark as read: ${err}`));
      }
      return next();
    },
    async (req, res, next) => {
      if (req.order.seen) return res.status(409).send({ message: 'Wish already marked as seen.' });
      return next();
    },
    async (req, res, next) => {
      logger.log('silly', 'marking wish as seen');
      req.order.seen = true;
      await req.order.save();
      res.status(201);
    }
  );

  orderRoutes.patch(
    '/read/:id',
    async (req, res, next) => {
      if (!req.user) return res.status(401).send('No user logged in.');
      try {
        req.order = await orderService.getOrder({ _id: req.params.id });
        if (req.user.aliases[0].toString() !== req.order.alias.toString())
          return res.status(403).send("User doesn't have permission.");
      } catch (err) {
        return next(new ApplicationError({}, `Couldn't mark as read: ${err}`));
      }
      return next();
    },
    async (req, res, next) => {
      if (req.order.noteToWisher && req.order.noteToWisher.read)
        return res.status(409).send({ message: 'Note to wisher already read.' });
      return next();
    },
    async (req, res, next) => {
      logger.log('silly', 'marking note to wisher as read');
      req.order.noteToWisher.read = true;
      await req.order.save();
      res.status(201);
    }
  );
  orderRoutes.patch(
    '/reply/:id',
    async (req, res, next) => {
      if (!req.user) return res.status(401).send('No user logged in.');
      try {
        req.order = await orderService.getOrder({ _id: req.params.id });
        if (req.user.aliases[0].toString() !== req.order.alias.toString())
          return res.status(403).send("User doesn't have permission.");
      } catch (err) {
        return next(new ApplicationError({}, `Couldn't reply to tender ${err}`));
      }
      return next();
    },
    async (req, res, next) => {
      if (req.order.noteToTender && req.order.noteToTender.message)
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
          req.order.noteToTender = { message, sent: new Date().toISOString() };
          await req.order.save();
        }
      } catch (err) {
        return next(new ApplicationError({}, `Couldn't reply to tender ${err}`));
      }
      return res.status(200).send({ messageSent: message });
    }
  );
  return orderRoutes;
};
