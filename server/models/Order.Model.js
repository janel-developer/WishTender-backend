/* eslint-disable global-require */
const mongoose = require('mongoose');
const { ApplicationError } = require('../lib/Error');

const orderSchema = new mongoose.Schema(
  // need to add any information about the buyer we can get
  // need to add any information about the wishers stripe account we can get
  {
    buyerInfo: { type: Object },
    wishlistItemInfo: {
      type: Object,
      required: true,
    },
    // need buyers email to send
    // cart
    // payment id
    amountToWishTender: {
      type: String,
      required: true,
      trim: true,
    },
    amountToUser: {
      type: String,
      required: true,
      trim: true,
    },
    processorFee: {
      type: String,
      required: true,
      trim: true,
    },
    processedBy: {
      type: String,
      enum: ['Stripe'],
      required: true,
      trim: true,
    },

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

orderSchema.path('wishlistItemInfo').validate(async function (value) {
  if (value.collection) {
    throw new ApplicationError(
      { alias: value },
      `Wishlist item info should be a deep copy of a wishlist item, not an actual Wishlist Item model document. Try JSON.parse(JSON.stringify(wishlistItem)) : ${value}`
    );
  } else {
    return true;
  }
}, `wishlistItemInfo is mongoose document but shouldn't be`);

/**
 * @class orderSchema
 * @param {Object} wishlistItemInfo wishlistItemInfo copy
 * @param {String} amountToWishTender
 * @param {String} amountToUser
 * @param {String} processingFee
 * @param {String} processedBy Enum "Stripe"
 * @param {ObjectId} wishlist
 * @param {ObjectId} alias
 * @param {ObjectId} user
 */
const Order = mongoose.model('Order', orderSchema);

module.exports = Order;
