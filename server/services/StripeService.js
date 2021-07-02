const { v4: uuidv4 } = require('uuid');
const logger = require('../lib/logger');

const Fees = require('../lib/Fees');
const StripeAccountInfoService = require('./StripeAccountInfoService');
const StripeAccountInfoModel = require('../models/StripeAccountInfo.Model');
const CartService = require('./CartService');

const AliasModel = require('../models/Alias.Model');

const { ApplicationError } = require('../lib/Error');
require('dotenv').config();
const { currencyInfo } = require('../lib/currencyFormatHelpers');

/**
 * Logic for interacting with the stripe api
 */
class StripeService {
  /**
   * Constructor
   * @param {*} stripe pass in stripe instance
   */
  constructor(stripe) {
    this.stripe = stripe;
    this.Fees = Fees;
    this.CartService = CartService;
    this.stripeAccountInfoService = new StripeAccountInfoService(StripeAccountInfoModel);
    this.StripeAccountInfoService = StripeAccountInfoService;
    this.AliasModel = AliasModel;

    // https://stripe.com/docs/connect/cross-border-payouts
    this.supportedPayoutCountries = [
      'AU',
      'AT',
      'BE',
      'BG',
      'CA',
      'CY',
      'CZ',
      'DK',
      'EE',
      'FI',
      'FR',
      'DE',
      'GR',
      'HK',
      'IE',
      'IT',
      'LV',
      'LT',
      'LU',
      'MT',
      'NL',
      'NZ',
      'NO',
      'PL',
      'PT',
      'RO',
      'SG',
      'SK',
      'SI',
      'ES',
      'SE',
      'CH',
      'GB',
      'US',
    ];
  }

  /**
   * Rate * fromCurrencyAmount(in smallest unit) * decimal Multiplier = toCurrencyAmount(in smallest unit)
   * @param {String} fromCurrency
   * @param {String} toCurrency
   */
  static decimalMultiplier(fromCurrency, toCurrency) {
    const stripeDecimalPlaces = (cur) => (cur !== 'UGX' ? currencyInfo(cur).decimalPlaces : 2);
    const fromDecimals = stripeDecimalPlaces(fromCurrency);
    const toDecimals = stripeDecimalPlaces(toCurrency);
    return 10 ** (toDecimals - fromDecimals);
  }

  /**
   * Create LineItems
   * @param {Object} aliasCart
   * @param {Int} stripeFee
   * @param {Int} appFee
   * @param {String} currency = 'USD'
   */
  static createLineItems(aliasCart, stripeFee, appFee, currency = 'USD') {
    const lineItems = [];
    const itemArray = Object.values(aliasCart.items);
    itemArray.forEach((item) =>
      lineItems.push({
        name: `WishTender for ${item.item.itemName}`,
        images: ['https://i.ibb.co/1nBVsqw/gift.png'],
        quantity: item.qty,
        currency,
        amount: item.item.price, // item.price is item.item.price * item.qty
      })
    );
    lineItems.push(
      {
        name: `Stripe Fee`,
        images: ['https://i.ibb.co/vmfXbyj/stripe.png'],
        quantity: 1,
        currency,
        amount: stripeFee,
      },
      {
        name: `WishTender Fee`,
        images: ['https://i.ibb.co/5vQDJFJ/wishtender.png'],
        quantity: 1,
        currency,
        amount: appFee,
      }
    );
    return lineItems;
  }

  /**
   * Create LineItems Simplified
   * @param {Object} aliasCart
   * @param {Int} stripeFee
   * @param {Int} appFee
   * @param {String} currency = 'USD'
   */
  static createLineItemsSimplified(aliasCart, appFee, currency = 'USD') {
    const lineItems = [];
    const itemArray = Object.values(aliasCart.items);
    itemArray.forEach((item) =>
      lineItems.push({
        name: `WishTender for ${item.item.itemName}`,
        images: ['https://i.ibb.co/1nBVsqw/gift.png'],
        quantity: item.qty,
        currency,
        amount: item.item.price, // item.price is item.item.price * item.qty
      })
    );
    lineItems.push({
      name: `WishTender Fee`,
      images: ['https://i.ibb.co/5vQDJFJ/wishtender.png'],
      quantity: 1,
      currency,
      amount: appFee,
    });
    return lineItems;
  }

  /**
   * Create stripe session
   * @param {Int} lineItems
   * @param {Int} wishersTender
   * @param {String} account stripe account id
   *
   * creates a stripe checkout session.
   * returns the session object.
   * Use the session object session id to redirect to the stripe.com checkout
   * session on the front end
   * using the stripe client side library
   * ex: stripe.redirectToCheckout({ sessionId: data.session.id });
   */
  async createStripeSession(lineItems, wishersTender, account, aliasId) {
    logger.log('silly', 'creating stripe session');
    let session;

    // const paymentIntent = await stripe.paymentIntents.create({
    //   payment_method_types: ['card'],
    //   amount: 1000,
    //   currency: 'usd',
    //   on_behalf_of: '{{CONNECTED_STRIPE_ACCOUNT_ID}}',
    // });
    try {
      session = await this.stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: lineItems,
        payment_intent_data: {
          // The account receiving the funds, as passed from the client.
          //not usd

          //usd account
          transfer_data: {
            amount: wishersTender,
            destination: account,
          },
        },
        // mode: 'setup',
        // setup_intent_data: { on_behalf_of: account },
        // ?session_id={CHECKOUT_SESSION_ID} means the redirect will have the session ID set as a query param
        success_url: `${process.env.API_BASEURL}/api/checkout/success?true&session_id={CHECKOUT_SESSION_ID}&alias_id=${aliasId}`, // should clear cart and add order to database
        cancel_url: `${process.env.API_BASEURL}/api/checkout/canceled?session_id={CHECKOUT_SESSION_ID}`,
      });
    } catch (err) {
      throw new ApplicationError(
        { err },
        `Couldn't create Stripe checkout session because of an internal error.`
      );
    }
    return session;
  }

  /**
   * Create checkout session from cart and currency
   * @param {Object} aliasCart
   * @param {String} presentmentCurrency //buyers currency
   *
   */
  async checkoutCart(aliasCart, presentmentCurrency, usToPresRate, decimalMultiplierUsToPres) {
    // get alias stripe account
    const alias = await this.AliasModel.findOne({ _id: aliasCart.alias._id })
      .populate({
        path: 'user',
        model: 'User',
        populate: {
          path: 'stripeAccountInfo',
          model: 'StripeAccountInfo',
        },
      })
      .exec();

    // Get the stripe account info
    const { stripeAccountInfo } = alias.user;

    // ----- removing the nonsense I did
    // // see if stripe account is due for $2 fee
    // const isAccountFeeDue = this.StripeAccountInfoService.isAccountFeeDue(stripeAccountInfo);
    // // calculate fees
    // const fees = new this.Fees(
    //   aliasCart.totalPrice,
    //   process.env.APPFEE,
    //   isAccountFeeDue,
    //   presentmentCurrency !== 'USD',
    //   stripeAccountInfo.currency !== 'USD',
    //   usToPresRate,
    //   decimalMultiplierUsToPres
    // );
    // // create line items
    // const lineItems = StripeService.createLineItems(
    //   aliasCart,
    //   fees.stripeTotalFee,
    //   fees.appFee,
    //   presentmentCurrency
    // );
    //---------------
    const lineItemsSimple = StripeService.createLineItemsSimplified(
      aliasCart,
      Math.round(aliasCart.totalPrice * 0.1),
      presentmentCurrency
    );
    // create stripe sesstion
    const checkoutSession = await this.createStripeSession(
      lineItemsSimple,
      aliasCart.totalPrice,
      stripeAccountInfo.stripeAccountId,
      aliasCart.alias._id
    );

    return checkoutSession;
  }

  /**
   * Create express account
   * @param {Object} accountInfo Account info. can be created with createAccountInfo()
   */
  async createExpressAccount(country, email) {
    const accountInfo = await StripeService.createAccountInfo(country, email);
    const account = await this.stripe.accounts.create(accountInfo);
    return account;
  }

  /**
   * Create account link
   * @param {String} accountId
   * @param {String} country two letter code
   */
  async createAccountLink(accountId) {
    try {
      const accountLinkInfo = {
        account: accountId,

        // The URL that the user will be redirected to if the account link
        // is no longer valid. Your refresh_url should trigger a method on
        // your server to create a new account link using this API,
        // with the same parameters, and redirect the user to the
        // new account link.
        refresh_url: `${process.env.API_BASEURL}/api/refreshConnectLink`,

        // The URL that the user will be redirected to upon leaving or
        // completing the linked flow.
        return_url: `${process.env.FRONT_BASEURL}/connect-success`,

        // account_onboarding for first time.
        // account_update for when the user updates their account:
        // Consider framing this (account_update) as “edit my profile” or “update my verification information”.
        type: 'account_onboarding',
      };
      const info = await this.stripe.accountLinks.create(accountLinkInfo, {
        idempotencyKey: uuidv4(),
      });
      return info.url;
    } catch (err) {
      throw new ApplicationError({ err }, `Internal error when trying to create onboard link`);
    }
  }

  /**
   * create a login link
   * @param {String} accountId an account id
   */
  async createLoginLink(accountId) {
    const link = await this.stripe.accounts.createLoginLink(
      accountId,
      {
        redirect_url: `${process.env.FRONT_BASEURL}/wish-tracker`,
      },
      { idempotencyKey: uuidv4() } // correct?
    );
    return link.url;
  }

  /**
   * Create account info
   * @param {String} country two letter country code, default US
   */
  static createAccountInfo(country, email) {
    const info = {
      country,
      type: 'express',
      email,

      //
      capabilities: {
        transfers: {
          requested: true,
        },
      },
    };

    if (country !== 'US') {
      info.tos_acceptance = {
        service_agreement: 'recipient',
      };
    }
    return info;
  }

  /**
   * delete account
   * @param {String} id
   */
  async deleteAccount(id) {
    try {
      await this.stripe.accounts.del(id);
    } catch (err) {
      throw new ApplicationError({ err }, `Couldn't delete account because of an internal error.`);
    }
  }

  /**
   * retrieve account
   * @param {String} id
   */
  async retrieveAccount(id) {
    try {
      const account = await this.stripe.accounts.retrieve(id);
      return account;
    } catch (err) {
      throw new ApplicationError(
        { err },
        `Couldn't retrieve account because of an internal error.`
      );
    }
  }
}

module.exports = StripeService;
