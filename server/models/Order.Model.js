/* eslint-disable global-require */
const mongoose = require('mongoose');
const { ApplicationError } = require('../lib/Error');

const orderSchema = new mongoose.Schema(
  {
    processorPaymentID: { type: String, required: true },
    buyerInfo: { type: Object },

    cart: { type: Object },
    session: {
      type: String,
      ref: 'Session',
      required: true,
    },
    convertedCart: { type: Object },
    noteToWisher: String,
    noteToTender: String,
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
    exchangeRate: { type: Object },
    wishersTender: { type: Object },
    total: { type: Object },
    cashFlow: { type: Object },
    paid: { type: Boolean, required: true },
    paidOn: { type: Date },
    createdAt: { type: Date, default: Date.now },
    expireAt: { type: Date, default: Date.now, index: { expires: '1d' } }, // 1d live as long as the stripe session
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
