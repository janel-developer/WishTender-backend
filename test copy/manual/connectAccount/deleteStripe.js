const stripe = require('stripe')(process.env.STRIPE_SECRET_TEST_KEY);
const StripeService = require('../../../server/services/StripeService');
const StripeAccountInfo = require('../../../server/models/StripeAccountInfo.Model');

const stripeService = new StripeService(stripe);

const id = 'acct_1IKW2IQ0Fqmd6V4j';

const deleteStripeForUsers = async () => {
  try {
    const infos = await StripeAccountInfo.find({});
    if (infos.length) {
      await new Promise((res, rej) => {
        let deleted = 0;
        infos.forEach(async (info) => {
          // const d = await stripeService.deleteAccount(info.stripeAccountId);
          const l = await stripe.accounts.del(info.stripeAccountId);

          if (l.deleted) deleted += 1;
          if (deleted === infos.length) res();
        });
      });
    }
  } catch (error) {
    console.log(error);
  }
};
module.exports = deleteStripeForUsers;
