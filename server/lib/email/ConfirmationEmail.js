const Email = require('./Email');
require('dotenv').config();

class ConfirmationEmail extends Email {
  /**
   * Constructs the ConfirmationEmail
   * @param {string} to `some@email.com`
   * @param {string} emailActivationUrl url
   */
  constructor(to, emailActivationUrl) {
    const subject = `Please confirm your email`;
    const html = `Please confirm your email: <a href = "${
      process.env.API_BASEURL + emailActivationUrl
    }">Confirm</a>`;
    const email = process.env.CONFIRM_EMAIL;
    const from = `WishTender Wishlist <${email}>`;
    const pass = process.env.CONFIRM_PASSWORD;
    super(email, pass, from, to, subject, html);
  }
}

module.exports = ConfirmationEmail;
