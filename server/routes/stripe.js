const express = require('express');
const logger = require('../lib/logger');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const StripeService = require('../services/StripeService');
const CartService = require('./CartService');

const stripeRoutes = express.Router();

const stripeService = new StripeService(stripe);

module.exports = () => {
  stripeRoutes.post('/checkout', async (req, res, next) => {
    logger.log('silly', `starting stripe checkout flow...`);
    const aliasId = req.params.alias;
    const aliasCart = req.cart[aliasId];
    const currency = req.session.currency;
    const checkoutSession = await stripeService.checkout(aliasCart, currency, stripeAccountId);
    res.send(checkoutSession.id);
  });
};
