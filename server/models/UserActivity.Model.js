const mongoose = require('mongoose');

const userActivitySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    hourlyVisits: {},
  },

  { timestamps: { createdAt: 'created_at' } }
);

userActivitySchema.path('user').validate(async function (value) {
  const UserModel = require('./User.Model');
  const user = await UserModel.findOne({ _id: value });
  if (!user) {
    throw new Error(
      `Invalid "user" property for UserActivity schema. No user found with id: ${value}`
    );
  } else {
    return true;
  }
}, 'Parent User non existent');

const StripeAccountInfo = mongoose.model('UserActivity', userActivitySchema);
module.exports = StripeAccountInfo;
