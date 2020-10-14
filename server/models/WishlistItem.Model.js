const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema(
  {
    itemName: { type: String, required: true, trim: true },
    price: { type: String, required: true, trim: true },
    currency: { type: String, trim: true },
    url: { type: String, trim: true },
    imageUrl: { type: String, trim: true },
    wishlist: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Wishlist',
      required: true,
    },
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

itemSchema.pre('remove', async function (next) {
  const Wishlist = require('./Wishlist.Model');
  const wishlist = await Wishlist.findById(this.wishlist);
  if (wishlist) {
    wishlist.wishlistItems.pull(this._id);
    await wishlist.save();
  }
  next();
});
itemSchema.path('wishlist').validate(async function (value) {
  const WishlistModel = require('./Wishlist.Model');
  const wishlist = await WishlistModel.findOne({ _id: value });
  if (!wishlist) {
    throw new ApplicationError(
      { wishlist: value },
      `Invalid WishlistItem "wishlist" property. No wishlist found with id: ${value}`
    );
  } else {
    return true;
  }
}, 'Parent Wishlist non existent');
itemSchema.path('user').validate(async function (value) {
  const UserModel = require('./User.Model');
  const user = await UserModel.findOne({ _id: value });
  if (!user) {
    throw new ApplicationError(
      { user: value },
      `Invalid WishlistItem "user" property. No user found with id: ${value}`
    );
  } else {
    return true;
  }
}, 'Parent User non existent');

const WishlistItem = mongoose.model('WishlistItem', itemSchema);
module.exports = WishlistItem;
