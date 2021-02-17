const express = require('express');
const cors = require('cors');
const stripe = require('stripe')(
  process.env.NODE_END === 'production'
    ? process.env.STRIPE_SECRET_KEY
    : process.env.STRIPE_SECRET_TEST_KEY
);
const StripeService = require('../services/StripeService');
const StripeAccountInfo = require('../models/StripeAccountInfo.Model');
const StripeAccountInfoService = require('../services/StripeAccountInfoService');

const stripeAccountInfoService = new StripeAccountInfoService(StripeAccountInfo);
const logger = require('../lib/logger');

const { ApplicationError } = require('../lib/Error');

const Alias = require('../models/Alias.Model');
const AliasService = require('../services/AliasService');

const aliasService = new AliasService(Alias);
const WishlistItem = require('../models/WishlistItem.Model');
const WishlistItemService = require('../services/WishlistItemService');
const { response } = require('express');

const itemService = new WishlistItemService(WishlistItem);

const connectRoutes = express.Router();

const stripeService = new StripeService(stripe);

// auth middleware functions====================
const authUserLoggedIn = async (req, res, next) => {
  if (req.user) {
    return next();
  }
  return res.status(401).send('No user logged in');
};

const authCountrySupported = async (req, res, next) => {
  if (stripeService.supportedPayoutCountries.includes(req.body.country)) {
    return next();
  }
  return res.status(400).send(`Country not supported: ${req.body.country}`);
};

const authStripeAccountInfoExists = async (req, res, next) => {
  if (req.user.stripeAccountInfo) {
    return next();
  }
  return res
    .status(409)
    .send('No stripe account object associated with the user. Use POST /createConnect');
};

const authStripeAccountTransfersActive = async (req, res, next) => {
  req.stripeAccountInfo = await stripeAccountInfoService.getAccountByUser(req.user._id);

  const accountId = req.stripeAccountInfo.stripeAccountId.toString();
  req.stripeAccount = await stripeService.retrieveAccount(accountId);
  if (req.stripeAccount.capabilities.transfers === 'active') {
    return next();
  }
  return res
    .status(409)
    .send(
      'The associated Stripe account must have capabilities.transfers equal to "active". This Stripe Account needs to be set up. Use get /refreshConnectLink'
    );
};

const authAccountInfoNotActivated = (req, res, next) => {
  if (!req.stripeAccountInfo.activated) {
    return next();
  }
  return res.status(409).send({ error: 'Account Activated', message: 'Account already activated' });
};
// ===============================

module.exports = () => {
  /*
   * POST /createConnect
   *
   * • stripe creates connect account
   * • create StipeAccountInfo and saves account id and info
   * • stripe creates onboarding link
   *
   * res onboard link
   */
  connectRoutes.post(
    '/createConnect',
    authUserLoggedIn,
    async (req, res, next) => {
      if (!req.user.stripeAccountInfo) {
        return next();
      }
      // check if activated and get onboardlink

      req.stripeAccountInfo = await stripeAccountInfoService.getAccountByUser(req.user._id);
      if (!req.stripeAccountInfo) next();
      req.stripeAccount = await stripeService.retrieveAccount(
        req.stripeAccountInfo.stripeAccountId
      );
      if (!req.stripeAccountInfo) {
        next();
      }

      if (req.stripeAccount.capabilities.transfers === 'active') {
        return res.status(409).send('Your stripe account has already been set up.');
      }

      if (req.body.country === req.stripeAccountInfo.country) {
        const onboardLink = await stripeService.createAccountLink(
          req.stripeAccountInfo.stripeAccountId
        );
        res.status(200).send({ onboardLink });
      } else {
        await stripeService.deleteAccount(req.stripeAccountInfo.stripeAccountId);
        await req.stripeAccountInfo.remove();
        return next();
      }

      // return res.status(409).send({ message: 'Stripe Account Info already set up.' });
    },
    authCountrySupported,
    async (req, res, next) => {
      const { country } = req.body;
      let account;
      try {
        account = await stripeService.createExpressAccount(country, req.user.email);
        const currency = account.default_currency.toUpperCase();

        const alias = await aliasService.getAlias({ _id: req.user.aliases[0] });
        const items = await itemService.wishlistItemsNotCurrency(alias._id, currency);
        if (items.length)
          return res.status(409).send({
            error: 'Currency Conflict',
            currency,
            message: `Could not activate StripeAccountInfo. User's Stripe account is set to ${currency}, but there are other currencies in the wishlist.`,
          });
        req.user.currency = currency;
        await req.user.save();
        alias.currency = currency;
        await alias.save();
        req.stripeAccountInfo = await stripeAccountInfoService.createAccount({
          stripeAccountId: account.id,
          activated: false,
          country: account.country,
          user: req.user._id,
          currency,
        });
        req.user.stripeAccountInfo = req.stripeAccountInfo._id;
        await req.user.save();
        const onboardLink = await stripeService.createAccountLink(account.id);
        res.status(200).send({ onboardLink });
      } catch (err) {
        try {
          if (req.stripeAccountInfo) req.stripeAccountInfo.remove();
          if (req.user.stripeAccountInfo) {
            req.user.stripeAccountInfo = undefined;
            await req.user.stripeAccountInfo;
          }
          if (account) await stripeService.deleteAccount(account.id);
          next(new ApplicationError({}, `Couldn't create Connect account:${err}`));
        } catch (err2) {
          next(
            new ApplicationError(
              {},
              `Couldn't create Connect account:${err}. Couldn't delete StripeAccountInfo and/or Stripe account object: ${err}`
            )
          );
        }
      }
    }
  );

  /*
   * GET /successConnect
   *
   * • stripe retrieves connect account
   * • check that connect account transfers is active
   *
   */
  // connectRoutes.get(
  //   '/successConnect',
  //   authUserLoggedIn,
  //   authStripeAccountInfoExists,
  //   authStripeAccountTransfersActive,
  //   async (req, res, next) => res.status(201).send()
  // );

  /*
   * PATCH /activateConnect
   *
   * • stripe retrieves connect account
   * • check that connect account is active
   * • save currency to user, alias, stripeAccountInfo
   * • checks that items are correct currency
   * • activates stripeAccountInfo
   *
   */
  connectRoutes.patch(
    '/activateConnect',
    authUserLoggedIn,
    authStripeAccountInfoExists,
    authStripeAccountTransfersActive,
    authAccountInfoNotActivated,
    async (req, res, next) => {
      try {
        req.stripeAccountInfo.activated = true;
        await req.stripeAccountInfo.save();
        return res.status(201).send();
      } catch (err) {
        return next(new ApplicationError({}, `Couldn't activate Stripe Account Info: ${err}`));
      }
    }
  );
  /*
   * GET /successConnect
   *
   * • stripe retrieves connect account
   * • check that connect account transfers is active
   *
   */
  // connectRoutes.get(
  //   '/successConnect',
  //   authUserLoggedIn,
  //   authStripeAccountInfoExists,
  //   authStripeAccountTransfersActive,
  //   async (req, res, next) => res.status(201).send()
  // );

  /*
   * Get /currentAccount
   *
   * • retrieves connect account info and stripe account info
   *
   */
  connectRoutes.get('/currentAccount', authUserLoggedIn, async (req, res, next) => {
    try {
      const respond = () => {
        if (req.stripeAccount) {
          req.stripeAccount = {
            transfer_capability: req.stripeAccount.capabilities.transfers,
            country: req.stripeAccount.country,
            default_currency: req.stripeAccount.default_currency,
          };
        }
        res.status(200).send({
          stripeAccountInfo: req.stripeAccountInfo || null,
          stripeAccount: req.stripeAccount || null,
        });
      };
      if (!req.user.stripeAccountInfo) {
        return respond();
      }
      req.stripeAccountInfo = await stripeAccountInfoService.getAccountByUser(req.user._id);
      if (!req.stripeAccountInfo) return respond();
      req.stripeAccount = await stripeService.retrieveAccount(
        req.stripeAccountInfo.stripeAccountId
      );
      return respond();
    } catch (err) {
      return next(new ApplicationError({}, `Couldn't get Stripe Account: ${err}`));
    }
  });

  /*
   * PATCH /correctCurrency
   *
   * •changes currency and converts values of items to stripe connect account currency
   * •activates connect
   *
   */

  connectRoutes.patch(
    '/correctCurrency',
    authUserLoggedIn,
    // authStripeAccountInfoExists,
    // authStripeAccountTransfersActive,
    // authAccountInfoNotActivated,
    // async (req, res, next) => {
    //   req.stripeAccountInfo = await stripeAccountInfoService.getAccountByUser(req.user._id);
    //   if (!req.stripeAccountInfo.currency) {
    //     return res.status(406).send({
    //       message: `Items currency couldn't be corrected. The associated stripe account info has no currency set.`,
    //     });
    //   }
    //   return next();
    // },

    async (req, res, next) => {
      try {
        await itemService.correctCurrency(
          req.user.aliases[0],
          req.body.currency,
          req.body.changeValue
        );
        const wrongCurrencyItems = await itemService.wishlistItemsNotCurrency(
          req.user.aliases[0],
          req.body.currency
        );
        if (wrongCurrencyItems.length) {
          throw new ApplicationError(
            {},
            `Tried to correct but there are still items of the wrong currency.`
          );
        } else {
          return res.status(201).send();
        }
      } catch (err) {
        return next(new ApplicationError({}, `Couldn't correct currency: ${err}`));
      }
    }
  );

  /*
   * GET /refreshConnectLink
   *
   * • stripe creates the account link
   *
   */
  connectRoutes.get(
    '/refreshConnectLink',
    authUserLoggedIn,
    authStripeAccountInfoExists,
    async (req, res, next) => {
      req.stripeAccountInfo = await stripeAccountInfoService.getAccountByUser(req.user._id);
      if (req.stripeAccountInfo.activated) {
        return res.status(409).send({ message: 'Stripe account already activated.' });
      }
      return next();
    },
    async (req, res, next) => {
      try {
        const onboardLink = await stripeService.createAccountLink(
          req.stripeService.stripeAccountId
        );
        res.redirect(301, onboardLink);
      } catch (err) {
        next(new ApplicationError({}, `Could not create onboarding link: ${err}.`));
      }
    }
  );

  return connectRoutes;
};
