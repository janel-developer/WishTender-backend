const mongoose = require('mongoose');
const { ApplicationError } = require('../lib/Error');

const stripeExpressSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    accountFeeDue: { type: Date },
    lastAccountFeePaid: { type: Date },
    accountFeesPaid: [{ type: Date }],
  },
  { timestamps: { createdAt: 'created_at' } }
);

stripeExpressSchema.path('user').validate(async function (value) {
  const UserModel = require('./User.Model');
  const user = await UserModel.findOne({ _id: value });
  if (!user) {
    throw new ApplicationError(
      { user: value },
      `Invalid Stripe Express Account "user" property. No user found with id: ${value}`
    );
  } else {
    return true;
  }
}, 'Parent User non existent');

const StripeExpressAccount = mongoose.model('StripeExpressAccount', stripeExpressSchema);
module.exports = StripeExpressAccount;
