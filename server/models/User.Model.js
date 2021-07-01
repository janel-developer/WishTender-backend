/* eslint-disable global-require */
const mongoose = require('mongoose');
const emailValidator = require('email-validator');
const bcrypt = require('bcrypt');
const stripe = require('stripe')(process.env.STRIPE_SECRET_TEST_KEY);
const softDelete = require('mongoosejs-soft-delete');
const mongoose_delete = require('mongoose-delete');
const cryptEmail = require('../lib/cryptEmail');
const StripeService = require('../services/StripeService');
const { ApplicationError } = require('../lib/Error');
const stripeService = new StripeService(stripe);

const ImageService =
  process.env.NODE_ENV === 'production' || process.env.REMOTE || process.env.AWS
    ? require('../services/AWSImageService')
    : require('../services/FSImageService');

const profileImageService = new ImageService(`images/profileImages/`);
const coverImageService = new ImageService(`images/coverImages/`);
const itemImageService = new ImageService(`images/itemImages/`);

const SALT_ROUNDS = 12;
const { Schema } = mongoose;
const normalizeAndEncrypt = (v) => cryptEmail.encrypt(v.toLowerCase());
const decrypt = (v) => cryptEmail.defs(v);
const userSchema = new Schema(
  {
    deleted: { type: Boolean, default: false },
    fName: {
      type: String,
      trim: true,
    },
    currency: {
      type: String,
    },
    country: { type: String },

    email: {
      // unique: true,
      type: String,
      required: true,
      trim: true,
      set: normalizeAndEncrypt,
      get: decrypt,
      // no lowercase since encrypted
      // lowercase: true,
      // partialFilterExpression addresses this https://github.com/dsanel/mongoose-delete/issues/86
      index: { unique: true, partialFilterExpression: { deleted: false } },
      // removed below because encrypted
      // validate: {
      //   validator: emailValidator.validate,
      //   message: (props) => `${props.value} is not a valid email address.`,
      // },
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
      getters: true,
      setters: true,
      transform(doc, ret) {
        delete ret.password;
      },
    },
    toObject: { getters: true, setters: true },
    runSettersOnQuery: true,
  },
  {
    // timestamps: { createdAt: 'created_at' },
  }
);

userSchema.set('timestamps', true);
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

    const alias = await AliasModel.findOneWithDeleted({ user: this._id });
    if (alias) {
      alias.deleteOne();
      await profileImageService.delete(alias.profileImage);
    }

    const StripeAccountInfoModel = require('./StripeAccountInfo.Model');
    if (this.stripeAccountInfo) {
      const stripeAccountInfo = await StripeAccountInfoModel.findOneWithDeleted({ user: this._id });
      await StripeAccountInfoModel.deleteOne({ _id: this.stripeAccountInfo });
      const { stripeAccountId } = stripeAccountInfo;
      if (stripeAccountId) await stripeService.deleteAccount(stripeAccountId);
    }
    const WishlistModel = require('./Wishlist.Model');
    const wishlist = await WishlistModel.findOneWithDeleted({ user: this._id });
    if (wishlist) {
      await wishlist.deleteOne();
      await coverImageService.delete(wishlist.coverImage);
    }

    const WishlistItemModel = require('./WishlistItem.Model');

    const items = await WishlistItemModel.find({ user: this._id });
    if (items.length) {
      await new Promise((resolve) => {
        let itemsUpdated = 0;
        items.forEach(async (item) => {
          await item.deleteOne();
          if (!item.orders.length) await itemImageService.delete(item.itemImage);
          itemsUpdated += 1;
          if (itemsUpdated === items.length) resolve();
        });
      });
    }
    next();
  } catch (err) {
    throw new ApplicationError({ err }, `Internal error when removing user resources.`);
  }
});

userSchema.methods.comparePassword = async function comparePassword(candidate) {
  return bcrypt.compare(candidate, this.password);
};
// userSchema.plugin(softDelete);
userSchema.plugin(mongoose_delete, {
  indexFields: ['deletedAt'],
  overrideMethods: 'all',
  validateBeforeDelete: false,
});

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
