const mongoose = require('mongoose');

const stripe = require('stripe')(
  process.env.STRIPE_SECRET_KEY // prod
  // process.env.STRIPE_SECRET_TEST_KEY // dev
);

const StripeAccountInfo = require('../models/StripeAccountInfo.Model');
const Users = require('../models/User.Model');

// mongoose.connect(process.env.DEVELOPMENT_DB_DSN, { useNewUrlParser: true });
// mongoose.connect(process.env.PRODUCTION_DB_DSN, { useNewUrlParser: true });
require('dotenv').config({ path: `${__dirname}/./../.env` });

const id = '617b14aa48e12b000480b5d4';
(async () => {
  // const deleted = await stripe.accounts.del('acct_1JncWlQ6pu2foFrq');
  // console.log(deleted);
  try {
    const accountInfos = await StripeAccountInfo.find({ user: id });
    let deleted;
    accountInfos.forEach(async (accountInf) => {
      try {
        deleted = await stripe.accounts.del(accountInf.stripeAccountId);
        accountInf.remove();
        console.log(deleted);
      } catch (err) {
        console.log(err);
      }
    });
    const user = await Users.findOne({ _id: id });
    user.stripeAccountInfo = null;
    await user.save();
    console.log(user);
  } catch (err) {
    console.timeLog.log(err);
  }
})();
// (async () => {
//   try {
//     const user = await Users.findOne({ _id: '614e459e6355c60004c937d4' }).populate({
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
// })();
