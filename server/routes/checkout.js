require('dotenv').config({ path: `${__dirname}/./../../.env` });
const stripe = require('stripe')(
  process.env.NODE_ENV === 'production'
    ? process.env.STRIPE_SECRET_KEY
    : process.env.STRIPE_SECRET_TEST_KEY
);

// const mongoose = require('mongoose');

// const { Schema } = mongoose;
// const SessionSchema = new Schema({ session: String, _id: String }, { strict: false });
// const Session = mongoose.model('sessions', SessionSchema, 'sessions');
const middlewares = require('./middlewares');

const { body, cookie } = require('express-validator');
const express = require('express');
const { ObjectId } = require('mongoose').Types;
const logger = require('../lib/logger');
const StripeService = require('../services/StripeService');
const CartService = require('../services/CartService');
const CheckoutService = require('../services/CheckoutService');
const { unitToStandard } = require('../lib/currencyFormatHelpers');

const checkoutRoutes = express.Router();

const OrderService = require('../services/OrderService');
const OrderModel = require('../models/Order.Model');
const AliasModel = require('../models/Alias.Model');

const ExchangeRatesApiInterface = require('../lib/ExchangeRate-Api');

const ratesApi = new ExchangeRatesApiInterface();

const orderService = new OrderService(OrderModel);

const authOrderNotPaidFor = async (req, res, next) => {
  // eslint-disable-next-line camelcase
  const { session_id } = req.query;
  const sess = await stripe.checkout.sessions.retrieve(session_id, {
    expand: ['payment_intent.charges.data'],
  });
  if (sess.payment_status === 'paid')
    return res.status(409).send('This order was already paid for.');

  return next();
};
const authOrderPaidFor = async (req, res, next) => {
  const sess = await stripe.checkout.sessions.retrieve(req.query.session_id, {
    expand: ['payment_intent.charges.data'],
  });
  if (sess.payment_status !== 'paid') return res.status(409).send("This order wasn't paid for");
  req.stripeExpandedSession = sess;
  return next();
};

module.exports = () => {
  checkoutRoutes.get(
    // this is the route that stripe send users too after a success. I'm not sure if it is incorrect because it is a get and gets are supposed to be "safe" but this is changing the database.
    '/success',
    authOrderPaidFor,
    async (req, res, next) => {
      // eslint-disable-next-line camelcase
      const { session_id, alias_id } = req.query;

      const alias = await AliasModel.findOne({ _id: alias_id })
        .populate({
          path: 'user',
          model: 'User',
        })
        .exec();

      return res.redirect(
        301,
        `${process.env.FRONT_BASEURL}/order?success=true&session_id=${session_id}&aliasHandle=${alias.handle}`
      );
    }
  );

  checkoutRoutes.get('/canceled', authOrderNotPaidFor, async (req, res, next) => {
    // eslint-disable-next-line camelcase
    const { session_id } = req.query;
    await orderService.deleteOrder({ processorPaymentID: session_id });
    return res.redirect(301, `${process.env.FRONT_BASEURL}/cart`);
  });
  checkoutRoutes.post(
    '/',
    //to do===> validate that stripe account confirmed/active do we need to?

    async (req, res, next) => {
      const aliasId = req.body.alias;
      if (!ObjectId.isValid(aliasId))
        return res.status(400).send({ message: `Alias id not valid.` });

      const alias = await AliasModel.findById(aliasId);

      if (!alias) return res.status(400).send({ message: `Alias doesn't exist` });
      return next();
    },
    cookie('currency', 'No currency set').custom(
      (currency, { req, location, path }) => (req.user && req.user.currency) || currency
    ),
    cookie(
      'currency',
      'Cookie currency must be upper case and 3 letters or you must be logged in or set to no conversion.'
    ).custom(
      (currency, { req, location, path }) =>
        currency === 'noConversion' ||
        (currency.length === 3 && currency.toUpperCase() === currency)
    ),
    body('alias', `No alias id included.`).exists(),
    body('order', `Missing order info`).exists(),
    body('order.buyerInfo.fromLine', `Must be less than 25 characters.`).isLength({ max: 35 }),
    body('order.buyerInfo.email', `Invalid email.`).isEmail(),
    async (req, res, next) => {
      // this validation was called imperatively to get access to next()
      await body('order.noteToWisher', `Note too long.`)
        .optional()
        .custom(async (note, { req, location, path }) => {
          const aliasCart = req.session.cart.aliasCarts[req.body.alias];
          const { currency } = aliasCart.alias;
          const { totalPrice } = aliasCart;
          // get US price in dollar units
          let itemToUSD;
          if (currency === 'USD') {
            itemToUSD = totalPrice;
          } else {
            let rate;
            // get conversion
            try {
              // ratesapi.io supports all the currencies of cross-borderpayouts as of 3/23/21. If this fails then we need to check if stripe or the rates api has changed
              rate = await ratesApi.getExchangeRate(currency, 'USD');
            } catch (error) {
              return next(error);
            }
            const decimalMultiplier = StripeService.decimalMultiplier(currency, 'USD');
            // we have to convert the price to the correct units, test with other units that this whole thing works
            itemToUSD = Math.round(rate * totalPrice * decimalMultiplier);
          }
          const usdDollars = unitToStandard(itemToUSD, 'USD');
          const noteLengthOK = note.length <= usdDollars + 30;
          if (!noteLengthOK)
            throw new Error(
              `Note must be less than ${usdDollars} characters. You're note is ${
                note.length - usdDollars
              } characters too long. Or add items to your gift to access more characters.`
            );
          return true;
        })
        .run(req);
      next();
    },

    middlewares.throwIfExpressValidatorError,
    async (req, res, next) => {
      // check price updates
      logger.log('silly', `checking prices are still current`);

      const aliasId = req.body.alias;

      const aliasCart = req.session.cart.aliasCarts[aliasId];
      // const result = await CartService.updateAliasCartPrices(aliasCart);
      const result = await CartService.updateAliasCart(aliasCart);
      if (result.modified.itemsModified.length) {
        req.session.cart.aliasCarts[aliasId] = result.aliasCart;
        return res.status(409).send({
          cartsModified: [result.modified],
          message:
            'Some items in your cart have been updated by the wishlist owner or are no longer available. Refresh cart to check updated items before continuing.',
        });
      }

      logger.log('silly', `starting checkout flow...`);
      let currency;
      if (req.user) {
        currency = req.user.currency;
      } else if (req.cookies.currency === 'noConversion') {
        currency = aliasCart.alias.currency;
      } else {
        currency = req.cookies.currency;
      }

      const orderObject = req.body.order;
      orderObject.noteToWisher = { message: orderObject.noteToWisher, read: null };
      orderObject.session = req.sessionID;
      orderObject.alias = req.body.alias;
      try {
        const checkoutSession = await CheckoutService.checkout(aliasCart, currency, orderObject);
        return res.status(201).send({ checkoutSessionId: checkoutSession.id });
      } catch (err) {
        next(err);
      }
    }
  );

  return checkoutRoutes;
};
