const mongoose = require('mongoose');
const { ApplicationError } = require('../lib/Error');

const stripeInfoSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    stripeAccountId: { type: String, required: true },
    currency: { type: String, required: true },
    accountFeeDue: { type: Date },
    lastAccountFeePaid: { type: Date },
    accountFeesPaid: [{ type: Date }],
  },
  { timestamps: { createdAt: 'created_at' } }
);

stripeInfoSchema.path('user').validate(async function (value) {
  const UserModel = require('./User.Model');
  const user = await UserModel.findOne({ _id: value });
  if (!user) {
    throw new ApplicationError(
      { user: value },
      `Invalid Stripe Account Information "user" property. No user found with id: ${value}`
    );
  } else {
    return true;
  }
}, 'Parent User non existent');

const StripeAccountInfo = mongoose.model('StripeAccountInfo', stripeInfoSchema);
module.exports = StripeAccountInfo;
