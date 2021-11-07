const Email = require('../Email');
const Currency = require('../../currency');
const ExchangeRateAPI = require('../../ExchangeRate-Api');
const emailHtml = require('./html');
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

    const pass = process.env.RECEIPT_PASSWORD;
    const email =
      process.env.NODE_ENV === 'production' ||
      (process.env.NODE_ENV === 'development' && process.env.REMOTE === 'true')
        ? process.env.RECEIPT_EMAIL
        : process.env.TEST_EMAIL;

    const from = `WishTender <${email}>`;
    const subject = `Your Receipt`;

    const fee = currency.smallestUnitToFormatted(
      order.cashFlow.customerCharged.amount - order.cashFlow.customerCharged.amountBeforeFees,
      'en',
      order.cashFlow.customerCharged.currency
    );
    const totalPrice = currency.smallestUnitToFormatted(
      order.cashFlow.customerCharged.amount,
      'en',
      order.cashFlow.customerCharged.currency
    );
    const items = Object.values(order.convertedCart ? order.convertedCart.items : order.cart.items);

    // format the price
    items.forEach((item) => {
      item.price = currency.smallestUnitToFormatted(
        item.price,
        'en',
        order.cashFlow.customerCharged.currency
      );
    });

    const html = emailHtml(order.cart.alias, items, order.cart.totalQty, totalPrice, fee);

    super(email, pass, from, order.buyerInfo.email, subject, html);
  }
}

module.exports = ReceiptEmail;
