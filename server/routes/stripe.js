const express = require('express');
const stripe = require('stripe')(
  process.env.NODE_ENV === 'production'
    ? process.env.STRIPE_SECRET_KEY
    : process.env.STRIPE_SECRET_TEST_KEY
);

const StripeService = require('../services/StripeService');
const StripeAccountInfoService = require('../services/StripeAccountInfoService');
const StripeAccountInfo = require('../models/StripeAccountInfo.Model');

const stripeAccountInfoService = new StripeAccountInfoService(StripeAccountInfo);
const middlewares = require('./middlewares');
const { ApplicationError } = require('../lib/Error');

const stripeRoutes = express.Router();

const stripeService = new StripeService(stripe);
module.exports = () => {
  stripeRoutes.get('/login', middlewares.authLoggedIn, async (req, res, next) => {
    try {
      const { from } = req.query;
      const account = await stripeAccountInfoService.getAccountByUser(req.user._id);
      const loginLink = await stripeService.createLoginLink(account.stripeAccountId, from);
      res.redirect(302, loginLink);
    } catch (err) {
      next(
        new ApplicationError(
          { err },
          `Couldn't get login link for stripe account because of an internal error.`
        )
      );
    }
  });
  return stripeRoutes;
};
