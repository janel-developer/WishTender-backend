const Token = require('../models/Token.Model');
const ApplicationError = require('../lib/Error');
const ResetPasswordEmail = require('../lib/email/ResetPasswordEmail');

/**
 * Logic for confirmation email
 */
class ResetPasswordEmailService {
  /**
   * Constructor
   * @param {*} ResetPasswordEmail Model
   */
  constructor(ResetPasswordEmailModel = ResetPasswordEmail) {
    this.ResetPasswordEmail = ResetPasswordEmailModel;
  }

  // eslint-disable-next-line class-methods-use-this
  async send(user) {
    let token;
    try {
      token = await Token.create({ user: user._id });
      console.log();
    } catch (err) {
      throw new ApplicationError({}, `Unable to create token: ${err.name}: ${err.message}`);
    }

    const resetPasswordEmail = new this.ResetPasswordEmail(
      user.email,
      `/api/reset-password/${user.email}/${token.token}`
    );
    resetPasswordEmail.send();
  }
}
module.exports = ResetPasswordEmailService;
