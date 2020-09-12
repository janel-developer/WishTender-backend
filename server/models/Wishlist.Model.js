const mongoose = require('mongoose');

const Wishlist = mongoose.model(
  'Wishlist',
  new mongoose.Schema(
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
    },
    { timestamps: { createdAt: 'created_at' } }
  )
);

module.exports = Wishlist;
