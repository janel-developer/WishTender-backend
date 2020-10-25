const ConfirmationEmail = require('../lib/email/ConfirmationEmail');
const { ApplicationError } = require('../lib/Error');
const logger = require('../lib/logger');
const Token = require('../models/Token.Model');
const OrderService = require('./OrderService');
const OrderModel = require('../models/Order.Model');
const Fees = require('../lib/Fees');
const StripeAccountInfoService = require('./StripeAccountInfoService');
const StripeAccountInfoModel = require('../models/StripeAccountInfo.Model');
require('dotenv').config();
const orderService = new OrderService(OrderModel);

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
   * Stripe session
   * @param {Int} lineItems
   * @param {Int} wishersTender
   * @param {String} account
   *
   * creates a stripe checkout session.
   * returns the session object.
   * Use the session object session id to redirect to the stripe.com checkout
   * session on the front end
   * using the stripe client side library
   * ex: stripe.redirectToCheckout({ sessionId: data.session.id });
   */
  async createStripeSession(lineItems, wishersTender, account) {
    const session = await this.stripe.checkout.sessions.create({
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
    return session;
  }

  /**
   * Create express account
   */
  async createExpressAccount(accountInfo) {
    // const account = await this.stripe.accounts.create(accountInfo);
    const account = await this.stripe.accounts.create(accountInfo);
    return account.id;
  }

  /**
   * Create account link
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

  async createLoginLink(accountId) {
    const link = await this.stripe.accounts.createLoginLink(accountId);
    return link.url;
  }

  /**
   * Create account info
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
