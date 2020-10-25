const { ApplicationError } = require('../lib/Error');

/**
 * Logic for interacting with the stripe express account model
 */
class StripeExpressAccountService {
  /**
   * Constructor
   * @param {*} stripe pass in stripe express account model
   */
  constructor(StripeExpressAccountModel) {
    this.StripeExpressAccountModel = StripeExpressAccountModel;
  }

  async isAccountFeeDue(userId) {
    let account;

    try {
      account = await this.StripeExpressAccountModel.findOne({
        user: userId,
      });
    } catch (err) {
      throw new ApplicationError({ userId, err }, `Stripe Express Account not found. ${err}`);
    }
    return account.accountFeeDue < Date.now();
  }
}

module.exports = StripeExpressAccountService;
