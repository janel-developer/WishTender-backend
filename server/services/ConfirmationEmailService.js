const Token = require('../models/Token.Model');
const ApplicationError = require('../lib/Error');
const ConfirmationEmail = require('../lib/email/ConfirmationEmail');

/**
 * Logic for confirmation email
 */
class ConfirmationEmailService {
  /**
   * Constructor
   * @param {*} UserModel Mongoose Schema Model
   */
  constructor(ConfirmationEmailModel = ConfirmationEmail) {
    this.ConfirmationEmail = ConfirmationEmailModel;
  }

  // eslint-disable-next-line class-methods-use-this
  async send(user) {
    let token;
    try {
      token = await Token.create({ user: user._id });
      console.log();
    } catch (err) {
      throw new ApplicationError({ err }, `Internal error when trying to create email token.`);
    }

    const confirmationEmail = new this.ConfirmationEmail(
      user.email,
      `/api/confirmation/${user.email}/${token.token}`
    );
    confirmationEmail.send();
  }
}
module.exports = ConfirmationEmailService;
