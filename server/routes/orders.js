const express = require('express');
const logger = require('../lib/logger');
const { ApplicationError } = require('../lib/Error');
const OrderModel = require('../models/Order.Model');
const OrderService = require('../services/OrderService');
const { authLoggedIn } = require('./middlewares');

const orderService = new OrderService(OrderModel);
const orderRoutes = express.Router();
const ThankYouEmail = require('../lib/email/ThankYouEmail');

async function authUserOwnsAliasInParam(req, res, next) {
  logger.log('silly', `authorizing user owns resource...`);

  // should authorize that user of alias is req.user
  if (!req.user.aliases.includes(req.params.alias)) {
    return res.status(403).send({
      message: `User doesn't own alias.`,
    });
  }
  return next();
}
const authUserOwnsOrder = (errorMessage) => async (req, res, next) => {
  try {
    req.order = await orderService.getOrder({ _id: req.params.id });
    if (req.user.aliases[0].toString() !== req.order.alias.toString())
      return res.status(403).send("User doesn't have permission.");
  } catch (err) {
    return next(new ApplicationError({ err }, `Internal error authorizing user owns order.`));
  }
  return next();
};
const throwIfAlreadyMarkedAsSeen = async (req, res, next) => {
  if (req.order.seen) return res.status(409).send({ message: 'Wish already marked as seen.' });
  return next();
};
module.exports = () => {
  orderRoutes.get('/:alias', authLoggedIn, authUserOwnsAliasInParam, async (req, res, next) => {
    logger.log('silly', 'getting orders by alias');
    const orders = await orderService.getCompletedOrdersByAlias(req.params.alias);

    const restructuredOrders = orders.map((order) => ({
      _id: order._id,
      seen: order.seen,
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
      noteToTender: order.noteToTender,
      paidOn: order.paidOn,
    }));
    res.send(restructuredOrders);
  });
  orderRoutes.get('/new/:alias', authLoggedIn, authUserOwnsAliasInParam, async (req, res, next) => {
    logger.log('silly', 'getting new orders by alias');
    const newOrders = await orderService.getNewOrdersByAlias({ _id: req.params.alias });
    res.status(200).send(newOrders);
  });
  orderRoutes.patch(
    '/seen/:id',
    authLoggedIn,
    authUserOwnsOrder("Couldn't mark as seen."),
    throwIfAlreadyMarkedAsSeen,
    async (req, res, next) => {
      logger.log('silly', 'marking wish as seen and note to wisher as read');
      req.order.seen = true;
      req.order.noteToWisher.read = true;
      await req.order.save();
      res.status(200).send();
    }
  );

  // read is not used in the front end, seen is used and we mark as read then
  // orderRoutes.patch(
  //   '/read/:id',
  //   authLoggedIn,
  //   authUserOwnsOrder,
  //   async (req, res, next) => {
  //     if (!req.user) return res.status(401).send('No user logged in.');
  //     try {
  //       req.order = await orderService.getOrder({ _id: req.params.id });
  //       if (req.user.aliases[0].toString() !== req.order.alias.toString())
  //         return res.status(403).send("User doesn't have permission.");
  //     } catch (err) {
  //       return next(new ApplicationError({}, `Couldn't mark as read: ${err}`));
  //     }
  //     return next();
  //   },
  //   async (req, res, next) => {
  //     if (req.order.noteToWisher && req.order.noteToWisher.read)
  //       return res.status(409).send({ message: 'Note to wisher already read.' });
  //     return next();
  //   },
  //   async (req, res, next) => {
  //     logger.log('silly', 'marking note to wisher as read');
  //     req.order.noteToWisher.read = true;
  //     await req.order.save();
  //     res.status(201);
  //   }
  // );
  orderRoutes.patch(
    '/reply/:id',
    authLoggedIn,
    authUserOwnsOrder("Couldn't reply."),
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
          `${process.env.API_BASEURL}/${alias.handle}`,
          message
        );

        const info = await thankYouEmail.sendSync().then((inf) => inf);
        if (info) {
          req.order.noteToTender = { message, sent: new Date().toISOString() };
          await req.order.save();
        }
      } catch (err) {
        return next(
          new ApplicationError({ err }, `Couldn't reply to tender because of an internal error.`)
        );
      }
      return res.status(200).send({ messageSent: message });
    }
  );
  return orderRoutes;
};
