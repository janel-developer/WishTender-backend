/* eslint-disable global-require */
const mongoose = require('mongoose');
const emailValidator = require('email-validator');
const bcrypt = require('bcrypt');
const StripeAccountInfo = require('./StripeAccountInfo.Model');

const SALT_ROUNDS = 12;
const { Schema } = mongoose;

const userSchema = new Schema(
  {
    // deleted: { type: Boolean, default: false },
    fName: {
      type: String,
      trim: true,
    },
    currency: {
      type: String,
    },
    country: { type: String },

    email: {
      unique: true,
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      index: { unique: true },
      validate: {
        validator: emailValidator.validate,
        message: (props) => `${props.value} is not a valid email address.`,
      },
    },
    password: {
      type: String,
      require: true,
      trim: true,
      index: { unique: true },
      minlength: 8,
    },
    confirmed: {
      type: Boolean,
      default: false,
    },
    aliases: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Alias',
      },
    ],
    wishlists: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Wishlists',
      },
    ],
    stripeAccountInfo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'StripeAccountInfo',
    },
  },
  {
    toJSON: {
      transform(doc, ret) {
        delete ret.password;
      },
    },
  },
  {
    timestamps: { createdAt: 'created_at' },
  }
);

userSchema.pre('save', async function preSave(next) {
  const user = this;
  if (!user.isModified('password')) return next();
  try {
    const hash = await bcrypt.hash(user.password, SALT_ROUNDS);
    user.password = hash;
    return next();
  } catch (err) {
    console.log(err);
    return next(err);
  }
});

userSchema.pre('remove', async function (next) {
  try {
    const AliasModel = require('./Alias.Model');

    const alias = await AliasModel.findOne({ user: this._id });
    if (alias) alias.deleteOne();

    const StripeAccountInfoModel = require('./StripeAccountInfo.Model');
    if (this.stripeAccountInfo) {
      await StripeAccountInfoModel.deleteOne({ _id: this.stripeAccountInfo });
    }
    const WishlistModel = require('./Wishlist.Model');
    const wishlist = await WishlistModel.findOne({ user: this._id });
    if (wishlist) wishlist.deleteOne();

    const WishlistItemModel = require('./WishlistItem.Model');

    const items = await WishlistItemModel.find({ user: this._id });
    await new Promise((resolve) => {
      let itemsUpdated = 0;
      items.forEach(async (item) => {
        await item.deleteOne();
        itemsUpdated += 1;
        if (itemsUpdated === items.length) resolve();
      });
    });
    next();
  } catch (err) {
    throw new Error(`Problem removing user resources: ${err}`);
  }
});

userSchema.methods.comparePassword = async function comparePassword(candidate) {
  return bcrypt.compare(candidate, this.password);
};

/**
 * @class orderSchema
 * @param {String} fName
 * @param {String} email required
 * @param {String} password required
 * @param {Boolean} confirmed default = false
 * @param {Array} aliases
 */
const User = mongoose.model('User', userSchema);

module.exports = User;
