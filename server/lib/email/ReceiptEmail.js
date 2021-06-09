const Email = require('./Email');
const Currency = require('../currency');
const ExchangeRateAPI = require('../ExchangeRate-Api');

const exchangeRateAPI = new ExchangeRateAPI();
const currency = new Currency(exchangeRateAPI);

require('dotenv').config();

class ReceiptEmail extends Email {
  /**
   * Constructor
   * @param {string} order the order
   */
  constructor(order) {
    const cart = order.convertedCart || order.cart;
    const { total } = order;
    const { alias } = cart;
    const pass = process.env.RECEIPT_PASSWORD;
    const email =
      process.env.NODE_ENV !== 'production' ? process.env.TEST_EMAIL : process.env.RECEIPT_EMAIL;
    const from = `WishTender <${email}>`;
    const subject = `Your Receipt`;
    const html = `<h1> Thank you for you for your purchase!</h1><p>You purchased a WishTender for ${
      alias.aliasName
    } <a href = 'https://${
      process.env.NODE_ENV === 'production' ? 'www' : 'staging'
    }.wishtender.com/${alias.handle}'>@${
      alias.handle
    }</a>. Total: ${currency.smallestUnitToFormatted(total.amount, 'en', total.currency)}.</p>`;

    super(email, pass, from, order.buyerInfo.email, subject, html);
  }
}

module.exports = ReceiptEmail;
