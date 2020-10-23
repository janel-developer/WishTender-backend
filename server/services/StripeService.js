const ConfirmationEmail = require('../lib/email/ConfirmationEmail');
const { ApplicationError } = require('../lib/Error');
const logger = require('../lib/logger');
const Token = require('../models/Token.Model');
const Fees = require('../lib/Fees');
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
  }

  /**
   * Stripe session
   * @param {Int} stripeFee
   * @param {Int} wishersTender
   * @param {Int} appFee
   * @param {String} account
   */
  async stripeSession(stripeFee, wishersTender, appFee, account) {
    const session = await this.stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          name: 'Gift',
          images: ['https://i.ibb.co/1nBVsqw/gift.png'],
          quantity: 1,
          currency: 'USD',
          amount: wishersTender, // Keep the amount on the server to prevent customers from manipulating on client
        },
        {
          name: 'Stripe fee',
          images: ['https://i.ibb.co/vmfXbyj/stripe.png'],
          quantity: 1,
          currency: 'USD',
          amount: stripeFee, // Keep the amount on the server to prevent customers from manipulating on client
        },
        {
          name: 'WishTender fee',
          images: ['https://i.ibb.co/5vQDJFJ/wishtender.png'],
          quantity: 1,
          currency: 'USD',
          amount: appFee, // Keep the amount on the server to prevent customers from manipulating on client
        },
      ],
      payment_intent_data: {
        // The account receiving the funds, as passed from the client.
        transfer_data: {
          amount: wishersTender, //if you ant to take the application fee out
          destination: account,
        },
      },
      // ?session_id={CHECKOUT_SESSION_ID} means the redirect will have the session ID set as a query param
      success_url: `http://localhost:3000/success`,
      cancel_url: `http://localhost:3000/canceled`,
    });
    return session;
  }
}
module.exports = StripeService;
