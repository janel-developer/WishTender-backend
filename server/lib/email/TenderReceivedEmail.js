const Email = require('./Email');

require('dotenv').config();

// console.log('process.env.NOTIFICATIONS_PASSWORD: ', process.env.NOTIFICATIONS_PASSWORD);
// console.log(
//   'email:',
//   process.env.NODE_ENV !== 'production' ||
//     (process.env.NODE_ENV === 'development' && process.env.REMOTE === 'true')
//     ? process.env.TEST_EMAIL
//     : process.env.NOTIFICATIONS_EMAIL
// );

class TenderReceivedEmail extends Email {
  /**
   * Constructor
   * @param {string} order the order
   * @param {string} wisherEmail the wishers email
   */
  constructor(order, wisherEmail) {
    const pass = process.env.NOTIFICATIONS_PASSWORD;
    const email =
      process.env.NODE_ENV === 'production' ||
      (process.env.NODE_ENV === 'development' && process.env.REMOTE === 'true')
        ? process.env.NOTIFICATIONS_EMAIL
        : process.env.TEST_EMAIL;
    const from = `WishTender <${email}>`;
    const subject = `You Received a WishTender from ${order.buyerInfo.fromLine}!`;
    const html = `<h1> New WishTender!</h1><p>You received a WishTender for ${
      order.cart.totalQty
    } from ${order.buyerInfo.fromLine}!<a href = 'https://${
      process.env.NODE_ENV === 'production' ? 'www' : 'staging'
    }.wishtender.com/wish-tracker'> View granted wishes</a>.</p>
    <h2>When Will I Receive My Funds?</h2>
    <p>If this is the first gift you received on WishTender, our secure 3rd party payment processor takes 7-14 days to pay out new accounts for security reasons. However, users have pleasantly reported, contrary to our processors' claims, that the first payout can be as fast as 2 days. Otherwise, if you have received gift funds before, you will receive the funds on the next payout day, which occur every two business days.</p>
    `;

    super(email, pass, from, wisherEmail, subject, html);
  }
}

module.exports = TenderReceivedEmail;
