const ConfirmationEmail = require('../lib/email/ConfirmationEmail');
const { ApplicationError } = require('../lib/Error');
const logger = require('../lib/logger');
const Token = require('../models/Token.Model');
const OrderService = require('./OrderService');
const OrderModel = require('../models/Order.Model');
const Fees = require('../lib/Fees');
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
  }

  /**
   * Checks if user will get $2 charge
   * @param {string} userId
   */
  static async isActivatedAccount(userId) {
    const isActivated = await orderService.didGetOrderLast30Days(userId);
    return isActivated;
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
        name: `WishTender for ${item.item.ItemName}`,
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
   * @param {Int} stripeFee
   * @param {Int} wishersTender
   * @param {Int} appFee
   * @param {String} account
   *
   * creates a stripe checkout session.
   * returns the session object.
   * Use the session object session id to redirect to the stripe.com checkout
   * session on the front end
   * using the stripe client side library
   * ex: stripe.redirectToCheckout({ sessionId: data.session.id });
   */
  async stripeSession(lineItems, wishersTender, account) {
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
}

// const stripes = new StripeService({ hi: 'bye' });

module.exports = StripeService;
