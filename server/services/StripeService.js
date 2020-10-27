const logger = require('../lib/logger');
const Fees = require('../lib/Fees');
const StripeAccountInfoService = require('./StripeAccountInfoService');
const StripeAccountInfoModel = require('../models/StripeAccountInfo.Model');
const { AliasModel } = require('../../test/helper');
const { ApplicationError } = require('../lib/Error');
require('dotenv').config();

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
    this.stripeAccountInfoService = new StripeAccountInfoService(StripeAccountInfoModel);
    this.StripeAccountInfoService = StripeAccountInfoService;
    this.AliasModel = AliasModel;
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
        amount: item.price, // item.price is item.item.price * item.qty
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
  async createStripeSession(lineItems, wishersTender, account) {
    console.log('inside createStripeSession');
    let session;
    try {
      session = await this.stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: lineItems,
        payment_intent_data: {
          // The account receiving the funds, as passed from the client.
          transfer_data: {
            amount: wishersTender,
            destination: account,
          },
        },
        // ?session_id={CHECKOUT_SESSION_ID} means the redirect will have the session ID set as a query param
        success_url: `http://localhost:3000/success?session_id={CHECKOUT_SESSION_ID}`, // should clear cart and add order to database
        cancel_url: `http://localhost:3000/canceled?session_id={CHECKOUT_SESSION_ID}`,
      });
    } catch (error) {
      throw new ApplicationError(
        { lineItems, wishersTender, account },
        `Couldn't create Stripe checkout session ${error}`
      );
    }
    console.log('before returning session to create stripe session');

    return session;
  }

  /**
   * Create checkout session from cart and currency
   * @param {Object} aliasCart
   * @param {String} presentmentCurrency
   *
   */
  async checkout(aliasCart, presentmentCurrency) {
    // Get the stripe account info
    const stripeAccountInfo = await this.stripeAccountInfoService.getAccountByUser(aliasCart.user);
    // see if stripe account is due for $2 fee
    const isAccountFeeDue = this.StripeAccountInfoService.isAccountFeeDue(stripeAccountInfo);
    // calculate fees
    const fees = new this.Fees(
      aliasCart.totalPrice,
      process.env.APPFEE,
      isAccountFeeDue,
      presentmentCurrency !== 'USD',
      stripeAccountInfo.country !== 'US'
    );
    // create line items
    const lineItems = StripeService.createLineItems(aliasCart, fees.stripeTotalFee, fees.appFee);
    // create strippe sesstion
    const session = await this.createStripeSession(
      lineItems,
      aliasCart.totalPrice,
      stripeAccountInfo.stripeAccountId
    );
    return session;
  }

  /**
   * Create express account
   * @param {Object} accountInfo Account info. can be created with createAccountInfo()
   */
  async createExpressAccount(accountInfo) {
    // const account = await this.stripe.accounts.create(accountInfo);
    const account = await this.stripe.accounts.create(accountInfo);
    return account.id;
  }

  /**
   * Create account link
   * @param {String} accountId
   */
  async createAccountLink(accountId) {
    const accountLinkInfo = {
      account: accountId,

      // The URL that the user will be redirected to if the account link
      // is no longer valid. Your refresh_url should trigger a method on
      // your server to create a new account link using this API,
      // with the same parameters, and redirect the user to the
      // new account link.
      refresh_url: 'http://localhost:3000/refresh',

      // The URL that the user will be redirected to upon leaving or
      // completing the linked flow.
      return_url: 'http://localhost:3000/return',

      // account_onboarding for first time.
      // account_update for when the user updates their account:
      // Consider framing this (account_update) as “edit my profile” or “update my verification information”.
      type: 'account_onboarding',
    };
    const info = await this.stripe.accountLinks.create(accountLinkInfo);
    return info.url;
  }

  /**
   * create a login link
   * @param {String} accountId an account id
   */
  async createLoginLink(accountId) {
    const link = await this.stripe.accounts.createLoginLink(accountId);
    return link.url;
  }

  /**
   * Create account info
   * @param {String} country two letter country code, default US
   */
  static createAccountInfo(country = 'US') {
    const info = {
      country,
      type: 'express',
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
}

module.exports = StripeService;
