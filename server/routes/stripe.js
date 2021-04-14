const StripeService = require('../services/StripeService');
const StripeAccountInfoService = require('../services/StripeAccountInfoService');
const StripeAccountInfo = require('../models/StripeAccountInfo.Model');
const stripeAccountInfoService = new StripeAccountInfoService(StripeAccountInfo);
const stripe = require('stripe')(
  process.env.NODE_END === 'production'
    ? process.env.STRIPE_SECRET_KEY
    : process.env.STRIPE_SECRET_TEST_KEY
);
const express = require('express');
const logger = require('../lib/logger');

const { ApplicationError } = require('../lib/Error');

const stripeRoutes = express.Router();

const stripeService = new StripeService(stripe);
module.exports = () => {
  stripeRoutes.get(
    '/login',
    async (req, res, next) => {
      if (req.user) {
        return next();
      }
      return res.status(401).send('No user logged in');
    },
    async (req, res, next) => {
      try {
        const account = await stripeAccountInfoService.getAccountByUser(req.user._id);
        const loginLink = await stripeService.createLoginLink(account.stripeAccountId);
        res.redirect(302, loginLink);
      } catch (err) {
        throw new ApplicationError({}, `Couldn't get login link for stripe account:${err}`);
      }
    }
  );
  return stripeRoutes;
};