const Email = require('./Email');

require('dotenv').config();

class TenderReceivedEmail extends Email {
  /**
   * Constructor
   * @param {string} order the order
   * @param {string} wisherEmail the wishers email
   */
  constructor(order, wisherEmail) {
    const pass = process.env.NOTIFICATIONS_PASSWORD;
    const email =
      process.env.NODE_ENV !== 'production'
        ? process.env.TEST_EMAIL
        : process.env.NOTIFICATIONS_EMAIL;
    const from = `WishTender <${email}>`;
    const subject = `You Received a WishTender from ${order.buyerInfo.fromLine}!`;
    const html = `<h1> New WishTender!</h1><p>You received a WishTender for ${
      order.cart.totalQty
    } item${order.cart.totalQty > 1 ? "'s" : ''}: ${Object.values(order.cart.items)
      .map((x) => x.item.itemName)
      .join(', ')}  <a href = 'https://${
      process.env.NODE_ENV === 'production' ? 'www' : 'staging'
    }.wishtender.com/wish-tracker'>Manage wishes</a>.</p>`;

    super(email, pass, from, wisherEmail, subject, html);
  }
}

module.exports = TenderReceivedEmail;
