const Email = require('../Email');
const html = require('./html');
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
    const date = new Date();
    const subject = `You Received a WishTender! ${
      date.getMonth() + 1
    }/${date.getDate()} ${date.getHours()}:${date.getMinutes()}
    `;

    super(email, pass, from, wisherEmail, subject, html);
  }
}

module.exports = TenderReceivedEmail;
