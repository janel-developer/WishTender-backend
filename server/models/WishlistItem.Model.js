const mongoose = require('mongoose');
const Wishlist = require('../models/Wishlist.Model');

const itemSchema = new mongoose.Schema(
  {
    itemName: { type: String, required: true, trim: true },
    price: { type: String, required: true, trim: true },
    currency: { type: String, trim: true },
    url: { type: String, trim: true },
    imageUrl: { type: String, trim: true },
    wishlist: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'wishlist',
    },
  },
  { timestamps: { createdAt: 'created_at' } }
);

itemSchema.pre('remove', async function (next) {
  let wishlist = await Wishlist.findById(this.wishlist);
  wishlist.wishlistItems.pull(this._id);
  await wishlist.save();
  wishlist = await Wishlist.findById(this.wishlist);
  next();
});

const WishlistItem = mongoose.model('WishlistItem', itemSchema);

module.exports = WishlistItem;
