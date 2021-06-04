const Email = require('./Email');
require('dotenv').config();

class ResetPasswordEmail extends Email {
  /**
   * Constructs the ResetPasswordEmail
   * @param {string} to `some@email.com`
   * @param {string} passwordResetUrl url
   */
  constructor(to, passwordResetUrl) {
    const subject = `Password reset`;
    const html = `To reset your password go here: <a href = "${
      process.env.API_BASEURL + passwordResetUrl
    }">Confirm</a>`;
    const email = process.env.RESET_EMAIL;
    const from = `WishTender Wishlist <${email}>`;
    const pass = process.env.RESET_PASSWORD;
    super(email, pass, from, to, subject, html);
  }
}

module.exports = ResetPasswordEmail;
