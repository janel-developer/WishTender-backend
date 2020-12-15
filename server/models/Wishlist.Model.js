const mongoose = require('mongoose');
const { ApplicationError } = require('../lib/Error');

const wishlistSchema = new mongoose.Schema(
  {
    wishlistName: {
      type: String,
      required: true,
      trim: true,
    },
    wishlistItems: [
      // reference, one-to-many
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'WishlistItem',
      },
    ],

    alias: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Alias',
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    wishlistMessage: {
      type: String,
    },
    coverImage: {
      type: String,
    },
  },
  {
    toJSON: {
      transform(doc, ret) {
        delete ret.user;
      },
    },
  },
  { timestamps: { createdAt: 'created_at' } }
);

wishlistSchema.pre('remove', async function (next) {
  const AliasModel = require('./Alias.Model');
  const WishlistItemModel = require('./WishlistItem.Model');
  const alias = await AliasModel.findById(this.alias);
  if (alias) {
    alias.wishlists.pull(this._id);
    await alias.save();
  }

  const items = await WishlistItemModel.find({ wishlist: this._id });
  await items.forEach((it) => it.remove());

  next();
});

wishlistSchema.path('alias').validate(async function (value) {
  const AliasModel = require('./Alias.Model');
  const alias = await AliasModel.findOne({ _id: value });
  if (!alias) {
    throw new ApplicationError(
      { alias: value },
      `Invalid Wishlist "alias" property. No alias found with id: ${value}`
    );
  } else {
    return true;
  }
}, 'Parent Alias non existent');
wishlistSchema.path('user').validate(async function (value) {
  const UserModel = require('./User.Model');
  const user = await UserModel.findOne({ _id: value });
  if (!user) {
    throw new ApplicationError(
      { user: value },
      `Invalid Wishlist "user" property. No user found with id: ${value}`
    );
  } else {
    return true;
  }
}, 'Parent User non existent');
const Wishlist = mongoose.model('Wishlist', wishlistSchema);

module.exports = Wishlist;
