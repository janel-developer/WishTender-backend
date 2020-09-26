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
        ref: 'WishlistItems',
      },
    ],

    alias: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Alias',
      required: true,
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
  console.log('wishlist', items);
  await items.forEach((it) => it.remove());

  next();
});

wishlistSchema.path('alias').validate(async function (value) {
  const AliasModel = require('./Alias.Model');
  const alias = await AliasModel.findOne({ _id: value });
  if (!alias) {
    throw new ApplicationError(
      { user: value },
      `Invalid Wishlist "alias" property. No alias found with id: ${value}`
    );
  } else {
    return true;
  }
}, 'Parent Alias non existent');
const Wishlist = mongoose.model('Wishlist', wishlistSchema);

module.exports = Wishlist;
