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
      process.env.FRONT_BASEURL + emailActivationUrl
    }">Confirm</a> <p>If you get an error 'Cannot read property '0' of null', try the link on desktop Chrome. This error has been reported on Android when using mobile Chrome.</p>`;
    const email = process.env.CONFIRM_EMAIL;
    const from = `WishTender Wishlist <${email}>`;
    const pass = process.env.CONFIRM_PASSWORD;
    super(email, pass, from, to, subject, html);
  }
}

module.exports = ConfirmationEmail;
