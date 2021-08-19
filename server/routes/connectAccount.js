const express = require('express');
const cors = require('cors');
const stripe = require('stripe')(
  process.env.NODE_ENV === 'production'
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
const middlewares = require('./middlewares');

// auth middleware functions====================

const authUserConfirmed = async (req, res, next) => {
  if (req.user.confirmed) {
    return next();
  }
  return res.status(403).send({ message: 'User email not confirmed.' });
};

const authCountrySupported = async (req, res, next) => {
  if (stripeService.supportedPayoutCountries.includes(req.user.country)) {
    return next();
  }
  return res.status(400).send({ message: `Country not supported: ${req.user.country}` });
};
const authCountrySet = async (req, res, next) => {
  if (req.user.country) {
    return next();
  }
  return res.status(400).send({ message: `User country must be set.` });
};

const validateStripeAccountInfoExists = async (req, res, next) => {
  if (req.user.stripeAccountInfo) {
    return next();
  }
  return res.status(409).send({
    message: 'No stripe account object associated with the user. Use POST /createConnect',
  });
};

const handleUnfinishedPrevReq = async (req, res, next) => {
  try {
    if (!req.user.stripeAccountInfo) {
      // no stripeAccountInfo ID, go to the next function to set up stripeaccountinfo
      return next();
    }
    // check if activated and get onboardlink

    req.stripeAccountInfo = await stripeAccountInfoService.getAccountByUser(req.user._id);

    // no actual stripeAccountInfo, go to the next function to set up stripeaccountinfo
    if (!req.stripeAccountInfo) return next();

    req.stripeAccount = await stripeService.retrieveAccount(req.stripeAccountInfo.stripeAccountId);

    // no actual stripeAccount, go to the next function to set up stripeaccount
    if (!req.stripeAccount) {
      next();
    }

    if (req.stripeAccount.capabilities.transfers === 'active') {
      return res.status(409).send({ message: 'This account has already been activated.' });
    }
    const { country } = req.user;
    if (country === req.stripeAccountInfo.country) {
      const onboardLink = await stripeService.createAccountLink(
        req.stripeAccountInfo.stripeAccountId
      );
      return res.status(200).send({ onboardLink });
    }
    // clean up if failed - I don't think this works- also i don't know if it should be here
    await stripeService.deleteAccount(req.stripeAccountInfo.stripeAccountId);
    await req.stripeAccountInfo.remove();
    delete req.user.stripeAccountInfo;
    await req.user.save();
    return next();
  } catch (err) {
    return next(
      new ApplicationError(
        { err },
        `Couldn't create connect account because of an internal error with unfinished connect account.`
      )
    );
  }
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

const validateAccountInfoNotActivated = (req, res, next) => {
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
    middlewares.authLoggedIn,
    authUserConfirmed,
    authCountrySet,
    handleUnfinishedPrevReq,
    authCountrySupported,
    async (req, res, next) => {
      const { country } = req.user;
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
        return res.status(200).send({ onboardLink });
      } catch (err) {
        try {
          if (req.stripeAccountInfo) req.stripeAccountInfo.remove();
          if (req.user.stripeAccountInfo) {
            req.user.stripeAccountInfo = undefined;
            await req.user.stripeAccountInfo;
          }
          if (account) await stripeService.deleteAccount(account.id);
          return next(
            new ApplicationError(
              { err },
              `Couldn't create connect account because of an internal error.`
            )
          );
        } catch (err2) {
          return next(
            new ApplicationError(
              { err, err2 },
              `Couldn't create connect account. Then couldn't delete StripeAccountInfo and/or Stripe account object because of an internal error.`
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
    middlewares.authLoggedIn,
    validateStripeAccountInfoExists,
    authStripeAccountTransfersActive,
    validateAccountInfoNotActivated,
    async (req, res, next) => {
      try {
        req.stripeAccountInfo.activated = true;
        await req.stripeAccountInfo.save();
        return res.status(200).send();
      } catch (err) {
        return next(
          new ApplicationError(
            { err },
            `Couldn't activate Stripe Account Info because of an internal error.`
          )
        );
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

  // /*
  //  * Get /currentAccount
  //  *
  //  * • retrieves connect account info and stripe account info
  //  *
  //  */
  // connectRoutes.get('/currentAccount', middlewares.authLoggedIn, async (req, res, next) => {
  //   try {
  //     const respond = () => {
  //       if (req.stripeAccount) {
  //         req.stripeAccount = {
  //           transfer_capability: req.stripeAccount.capabilities.transfers,
  //           country: req.stripeAccount.country,
  //           default_currency: req.stripeAccount.default_currency,
  //         };
  //       }
  //       return res.status(200).send({
  //         stripeAccountInfo: req.stripeAccountInfo || null,
  //         stripeAccount: req.stripeAccount || null,
  //       });
  //     };
  //     if (!req.user.stripeAccountInfo) {
  //       return respond();
  //     }
  //     req.stripeAccountInfo = await stripeAccountInfoService.getAccountByUser(req.user._id);
  //     if (!req.stripeAccountInfo) return respond();
  //     req.stripeAccount = await stripeService.retrieveAccount(
  //       req.stripeAccountInfo.stripeAccountId
  //     );
  //     return respond();
  //   } catch (err) {
  //     return next(new ApplicationError({}, `Couldn't get Stripe Account: ${err}`));
  //   }
  // });

  /*
   * PATCH /correctCurrency
   *
   * •changes currency and converts values of items to stripe connect account currency
   * •activates connect
   *
   */

  // connectRoutes.patch(
  //   '/correctCurrency',
  //   authUserLoggedIn,
  //   // authStripeAccountInfoExists,
  //   // authStripeAccountTransfersActive,
  //   // authAccountInfoNotActivated,
  //   // async (req, res, next) => {
  //   //   req.stripeAccountInfo = await stripeAccountInfoService.getAccountByUser(req.user._id);
  //   //   if (!req.stripeAccountInfo.currency) {
  //   //     return res.status(406).send({
  //   //       message: `Items currency couldn't be corrected. The associated stripe account info has no currency set.`,
  //   //     });
  //   //   }
  //   //   return next();
  //   // },

  //   async (req, res, next) => {
  //     try {
  //       await itemService.correctCurrency(
  //         req.user.aliases[0],
  //         req.body.currency,
  //         req.body.changeValue
  //       );
  //       const wrongCurrencyItems = await itemService.wishlistItemsNotCurrency(
  //         req.user.aliases[0],
  //         req.body.currency
  //       );
  //       if (wrongCurrencyItems.length) {
  //         throw new ApplicationError(
  //           {},
  //           `Tried to correct but there are still items of the wrong currency.`
  //         );
  //       } else {
  //         return res.status(201).send();
  //       }
  //     } catch (err) {
  //       return next(new ApplicationError({}, `Couldn't correct currency: ${err}`));
  //     }
  //   }
  // );

  /*
   * GET /refreshConnectLink
  
   *
   * • stripe creates the account link
   *
   */
  connectRoutes.get(
    '/refreshConnectLink',
    middlewares.authLoggedIn,
    validateStripeAccountInfoExists,
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
        res.redirect(302, onboardLink);
      } catch (err) {
        next(
          new ApplicationError(
            { err },
            `Could not create onboarding link because of an internal error.`
          )
        );
      }
    }
  );

  return connectRoutes;
};
