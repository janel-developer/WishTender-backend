const Email = require('./Email');
require('dotenv').config();

class ThankYouEmail extends Email {
  /**
   * Constructor
   * @param {string} to email `some@email.com`
   * @param {string} aliasName The wisher's alias name
   * @param {string} aliasUrl The wisher's alias's profile page or wishlist url
   * @param {string} thankYouMessage thank you text from the wisher
   */
  constructor(to, aliasName, aliasUrl, thankYouMessage) {
    const pass = process.env.THANKYOU_PASSWORD;
    const email =
      process.env.NODE_ENV !== 'production' ? process.env.TEST_EMAIL : process.env.THANKYOU_EMAIL;
    const from = `WishTender Wishlist <${email}>`;
    const subject = `Thank You from ${aliasName}`;
    const html = `<h1> Thank you message from <a href = '${aliasUrl}'>${aliasName}</a>: 
    <p>${thankYouMessage}</p>
    `;
    super(email, pass, from, to, subject, html);
  }
}

module.exports = ThankYouEmail;
