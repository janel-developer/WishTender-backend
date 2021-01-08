const { ApplicationError } = require('../lib/Error');

/**
 * Logic for interacting with the stripe express account model
 */
class StripeAccountInfoService {
  /**
   * Constructor
   * @param {*} stripe pass in stripe express account model
   */
  constructor(StripeAccountInfoModel) {
    this.StripeAccountInfoModel = StripeAccountInfoModel;
  }

  static isAccountFeeDue(account) {
    return account.accountFeeDue ? account.accountFeeDue < Date.now() : true;
  }

  async isAccountFeeDue(userId) {
    let account;

    try {
      account = await this.StripeAccountInfoModel.findOne({
        user: userId,
      });
    } catch (err) {
      throw new ApplicationError({ userId, err }, `Stripe Express Account not found. ${err}`);
    }
    return account.accountFeeDue < Date.now();
  }

  async getAccountByUser(userId) {
    let account;

    try {
      account = await this.StripeAccountInfoModel.findOne({
        user: userId,
      });
    } catch (err) {
      throw new ApplicationError({ userId, err }, `Stripe Express Account not found. ${err}`);
    }
    return account;
  }
}

module.exports = StripeAccountInfoService;
