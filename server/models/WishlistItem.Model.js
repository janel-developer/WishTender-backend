const mongoose = require('mongoose');

const WishlistItem = mongoose.model(
  'WishlistItem',
  new mongoose.Schema(
    {
      itemName: { type: String, required: true, trim: true },
      price: { type: String, required: true, trim: true },
      currency: { type: String, trim: true },
      url: { type: String, trim: true },
      imageUrl: { type: String, trim: true },
    },
    { timestamps: { createdAt: 'created_at' } }
  )
);

module.exports = WishlistItem;
