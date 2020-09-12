const mongoose = require('mongoose');

const Alias = new mongoose.Schema(
  {
    aliasName: String,
    handle: { type: String, unique: true },
    wishlists:
      // reference, one-to-many
      [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'wishlists',
        },
      ],
  },
  { timestamps: { createdAt: 'created_at' } }
);

module.exports = Alias;
