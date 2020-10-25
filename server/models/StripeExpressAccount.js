const mongoose = require('mongoose');
const { ApplicationError } = require('../lib/Error');

const stripeExpress = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: { createdAt: 'created_at' } }
);

aliasSchema.pre('remove', async function (next) {
  const UserModel = require('./User.Model');
  const WishlistModel = require('./Wishlist.Model');
  const user = await UserModel.findById(this.user);
  if (user) {
    user.aliases.pull(this._id);
    await user.save();
  }
  const wishlists = await WishlistModel.find({ alias: this._id });
  await wishlists.forEach((al) => al.remove());
  next();
});

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

const Alias = mongoose.model('Alias', aliasSchema);
module.exports = Alias;
