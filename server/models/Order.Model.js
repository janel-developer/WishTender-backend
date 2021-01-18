/* eslint-disable global-require */
const mongoose = require('mongoose');
const { ApplicationError } = require('../lib/Error');

const orderSchema = new mongoose.Schema(
  // need to add any information about the buyer we can get
  // need to add any information about the wishers stripe account we can get
  {
    processorPaymentID: { type: String, required: true },
    buyerInfo: { type: Object },

    cart: { type: Object },
    convertedCart: { type: Object },
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

    fees: { type: Object },
    exchangeRate: { wishTender: Number, stripe: Number },
    // user: {
    //   type: mongoose.Schema.Types.ObjectId,
    //   ref: 'User',
    //   required: true,
    // },
    wishersTender: { type: Number },
    total: { type: Number },
    paid: { type: Boolean, required: true },
    paidOn: { type: Date },
    createdAt: { type: Date, default: Date.now },
    expireAt: { type: Date, default: Date.now, index: { expires: '1m' } }, // 1d live as long as the stripe session
  },
  {
    toJSON: {
      transform(doc, ret) {
        delete ret.user;
        delete ret.buyerInfo.email;
      },
    },
  }
);

/**
 * @class orderSchema
 */
const Order = mongoose.model('Order', orderSchema);

module.exports = Order;
