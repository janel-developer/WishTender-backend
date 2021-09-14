const mongoose = require('mongoose');

const stripe = require('stripe')(
  //   process.env.STRIPE_SECRET_KEY // prod
  process.env.STRIPE_SECRET_TEST_KEY // dev
);

const StripeAccountInfo = require('../models/StripeAccountInfo.Model');
const Users = require('../models/User.Model');

mongoose.connect(process.env.DEVELOPMENT_DB_DSN, { useNewUrlParser: true });
// mongoose.connect(process.env.PRODUCTION_DB_DSN, { useNewUrlParser: true });
require('dotenv').config({ path: `${__dirname}/./../.env` });

(async () => {
  //   try {
  //     const user = await Users.findOne({ _id: '6133c636c3b5f37d6e283da8' }).populate({
  //       path: 'stripeAccountInfo',
  //       model: 'StripeAccountInfo',
  //     });
  //     let deleted;
  //     let stripeInfo;
  //     let deleteInfo;
  //     if (user.stripeAccountInfo) {
  //       if (user.stripeAccountInfo.stripeAccountId) {
  //         deleted = await stripe.accounts.del(user.stripeAccountInfo.stripeAccountId);
  //       }
  //       stripeInfo = await StripeAccountInfo.findOneWithDeleted({
  //         _id: user.stripeAccountInfo._id,
  //       });
  //       deleteInfo = await stripeInfo.remove();
  //       user.stripeAccountInfo = null;
  //       await user.save();
  //       console.log(user);
  //     }
  //   } catch (err) {
  //     console.log(err);
  //   }
})();
