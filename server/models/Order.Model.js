/* eslint-disable global-require */
const mongoose = require('mongoose');
const { ApplicationError } = require('../lib/Error');

const orderSchema = new mongoose.Schema(
  // need to add any information about the buyer we can get
  // need to add any information about the wishers stripe account we can get
  {
    processorPaymentID: { type: String, required: true },
    buyerInfo: { type: Object },
    wishlistItems: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'WishlistItems',
      },
    ],
    noteToWisher: String,
    payment: { type: Object },
    processedBy: {
      type: String,
      enum: ['Stripe'],
      required: true,
      trim: true,
    },
    alias: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Alias',
      required: true,
    },
    exchangeRate: { wishTender: Number, paymentProcessor: Number },
    // user: {
    //   type: mongoose.Schema.Types.ObjectId,
    //   ref: 'User',
    //   required: true,
    // },
    processed: { type: Boolean, required: true },
    processedAt: { body: String, date: Date },
    createdAt: { type: Date, default: Date.now },
    expireAt: {
      type: Date,
      default: Date.now,
      index: { expires: '1d' },
    },
  },
  {
    toJSON: {
      transform(doc, ret) {
        delete ret.user;
      },
    },
  }
);

/**
 * @class orderSchema
 */
const Order = mongoose.model('Order', orderSchema);

module.exports = Order;
