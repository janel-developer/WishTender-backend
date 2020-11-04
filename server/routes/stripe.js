const express = require('express');
const logger = require('../lib/logger');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const StripeService = require('../services/StripeService');
const CartService = require('../services/CartService');

const stripeRoutes = express.Router();

const stripeService = new StripeService(stripe);

module.exports = () => {
  stripeRoutes.post('/checkout', async (req, res, next) => {
    logger.log('silly', `starting stripe checkout flow...`);
    const aliasId = req.body.alias;
    const aliasCart = req.session.cart[aliasId];
    const { currency } = req.session;

    // check price updates
    const result = await CartService.updateAliasCartPrices(aliasCart);
    if (result.modified) {
      req.session.cart.aliasCarts[aliasId] = result.aliasCart;
      res.send(
        'Some prices in your cart have been updated by the wishlist owner. Please check prices before continuing'
      );
    }
    // start checkout
    const checkoutSession = await stripeService.checkoutCart(aliasCart, currency, stripeAccountId);
    res.send(checkoutSession.id);
  });
  stripeRoutes.post('/test', async (req, res, next) => {
    logger.log('silly', `starting stripe test...`);
    res.send(req.session);
  });
  return stripeRoutes;
};
