/* eslint-disable global-require */
const mongoose = require('mongoose');
const emailValidator = require('email-validator');
const bcrypt = require('bcrypt');

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
    aliases: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Alias',
      },
    ],
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
  const AliasModel = require('./Alias.Model');

  const aliases = await AliasModel.find({ user: this._id });
  await aliases.forEach((al) => al.remove());
});

userSchema.methods.comparePassword = async function comparePassword(candidate) {
  return bcrypt.compare(candidate, this.password);
};

const User = mongoose.model('User', userSchema);
module.exports = User;
