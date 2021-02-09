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
    return account.accountFees && account.accountFees.due
      ? account.accountFees.due < Date.now()
      : true;
  }

  async isAccountFeeDue(userId) {
    let account;

    try {
      account = await this.StripeAccountInfoModel.findOne({
        user: userId,
      });
    } catch (err) {
      throw new ApplicationError({ userId, err }, `Stripe Express Account Info not found. ${err}`);
    }
    return account.accountFees.accountFeeDueDue < Date.now();
  }

  async getAccountByUser(userId) {
    let account;

    try {
      account = await this.StripeAccountInfoModel.findOne({
        user: userId,
      });
    } catch (err) {
      throw new ApplicationError({ userId, err }, `Stripe Express Account Info not found. ${err}`);
    }
    return account;
  }

  async createAccount(accountInfo) {
    let account;

    try {
      account = await this.StripeAccountInfoModel.create(accountInfo);
    } catch (err) {
      throw new ApplicationError({}, `Stripe Express Account Info not created. ${err}`);
    }
    return account;
  }

  // async deleteAccount() {}
}

module.exports = StripeAccountInfoService;
