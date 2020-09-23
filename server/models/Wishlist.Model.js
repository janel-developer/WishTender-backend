const mongoose = require('mongoose');

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
        ref: 'wishlistItems',
      },
    ],
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'wishlist',
      required: true,
    },
    alias: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'alias',
      required: true,
    },
  },
  { timestamps: { createdAt: 'created_at' } }
);

wishlistSchema.pre('remove', async function (next) {
  const UserModel = require('./User.Model');
  const WishlistItemModel = require('./WishlistItem.Model');
  const user = await UserModel.findById(this.user);
  const alias = user.aliases.find((a) => a._id.toString() === this.alias.toString());
  alias.wishlists.pull(this._id);
  await user.save();

  await WishlistItemModel.deleteMany({ _id: { $in: this.wishlistItems } });

  next();
});
const Wishlist = mongoose.model('Wishlist', wishlistSchema);

module.exports = Wishlist;
