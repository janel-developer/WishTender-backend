const express = require('express');
const logger = require('../lib/logger');
// const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const stripeRoutes = express.Router();

module.exports = () => {
  stripeRoutes.post('/checkout', async (req, res, next) => {
    logger.log('silly', `starting stripe checkout flow...`);
  });
};
