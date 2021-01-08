require('dotenv').config({ path: `${__dirname}/./../../.env` });
const ExchangeRatesApiInterface = require('../lib/ExchangeRatesApiInterface');
const stripe = require('stripe')(
  process.env.NODE_END === 'production'
    ? process.env.STRIPE_SECRET_KEY
    : process.env.STRIPE_SECRET_TEST_KEY
);
const express = require('express');
const logger = require('../lib/logger');
const StripeService = require('../services/StripeService');
const CartService = require('../services/CartService');
const { ApplicationError } = require('../lib/Error');

const checkoutRoutes = express.Router();

const stripeService = new StripeService(stripe);
const OrderService = require('../services/OrderService');
const OrderModel = require('../models/Order.Model');

const orderService = new OrderService(OrderModel);

const ratesApi = new ExchangeRatesApiInterface();

module.exports = () => {
  checkoutRoutes.get('/success', async (req, res, next) => {
    // clear cart
    const { session_id, alias_id } = req.query;
    const sess = await stripe.checkout.sessions.retrieve(session_id);
    // const paymentIntent = await stripe.paymentIntents.retrieve(sess.payment_intent);
    const order = orderService.updateOrder(
      { processorPaymentID: session_id },
      { processed: true, processedAt: Date.now() }
    );
    if (Object.keys(req.session.cart.aliasCarts).length <= 1) {
      delete req.session.cart;
    } else {
      delete req.session.cart.aliasCarts[alias_id];
    }

    res.redirect(301, `http://localhost:3000/order?success=true&session_id=${session_id}`);
  });
  checkoutRoutes.get('/canceled', async (req, res, next) => {
    const { session_id } = req.query;
    const deleted = await orderService.deleteOrder({ processorPaymentID: session_id });
    res.redirect(301, `http://localhost:3000/cart`);
  });
  checkoutRoutes.post('/', async (req, res, next) => {
    logger.log('silly', `starting checkout flow...`);
    // check price updates
    const aliasId = req.body.alias;
    const aliasCart = req.session.cart.aliasCarts[aliasId];
    const result = await CartService.updateAliasCartPrices(aliasCart);
    if (result.modified) {
      req.session.cart.aliasCarts[aliasId] = result.aliasCart;

      return next(
        new ApplicationError(
          {},
          'Some prices in your cart have been updated by the wishlist owner. Please check prices before continuing'
        )
      );
    }
    const currency = req.session.user ? req.session.user.currency : null || req.cookies.currency;
    const orderObject = req.body.order;
    req.session.cart.aliasCarts['5ff37617d99f6bb8d438ff52'].alias.currency = 'USD';
    try {
      const checkoutSession = await checkout(aliasId, aliasCart, currency, orderObject);
      res.send(JSON.stringify({ checkoutSessionId: checkoutSession.id }));
    } catch (err) {
      next(err);
    }
  });

  return checkoutRoutes;
};
const checkout = async (aliasId, aliasCart, currency, orderObject) => {
  // get exchange rate
  let usToPres = 1;
  let cart = aliasCart;
  let destToPres;
  const aliasCurrency = aliasCart.alias.currency;
  if (aliasCurrency !== currency) {
    const exchangeRates = await ratesApi.getAllExchangeRates(currency);
    usToPres = 1 / exchangeRates.USD;
    destToPres = 1 / exchangeRates[aliasCurrency];
    cart = CartService.convert(aliasCart, destToPres);
  }

  // start checkout
  const checkoutSession = await stripeService.checkoutCart(cart, currency, usToPres);

  // create order
  const newOrderObject = { ...orderObject };
  newOrderObject.processorPaymentID = checkoutSession.id;
  newOrderObject.exchangeRate = {
    wishTender: destToPres || null,
  };
  orderService.createOrder(newOrderObject);
  return checkoutSession;
};
