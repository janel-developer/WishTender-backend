/* eslint-disable global-require */
const mongoose = require('mongoose');
const emailValidator = require('email-validator');
const bcrypt = require('bcrypt');
const AliasSchema = require('./schema/Alias.Schema');

const SALT_ROUNDS = 12;
const { Schema } = mongoose;

const userSchema = new Schema(
  {
    username: {
      type: String,
      require: true,
      trim: true,
      index: { unique: true },
      minlength: 3,
    },
    fName: {
      type: String,
      trim: true,
    },
    email: {
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
    aliases: {
      type: [AliasSchema],
      trim: true,
      index: { unique: true },
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
  const WishlistModel = require('./Wishlist.Model');
  const WishlistItemModel = require('./WishlistItem.Model');

  this.aliases.forEach(async (alias) => {
    const wishlists = await WishlistModel.find({ _id: { $in: alias.wishlists } });

    wishlists.forEach(async (wishlist) => {
      await WishlistItemModel.deleteMany({ _id: { $in: wishlist.wishlistItems } });
    });

    await WishlistModel.deleteMany({ _id: { $in: alias.wishlists } });
  });
  next();
});

userSchema.methods.comparePassword = async function comparePassword(candidate) {
  return bcrypt.compare(candidate, this.password);
};

const User = mongoose.model('User', userSchema);
module.exports = User;
