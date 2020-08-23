const mongoose = require('mongoose');
const emailValidator = require('email-validator');
const bcrypt = require('bcrypt');

const SALT_ROUNDS = 12;
const { Schema } = mongoose;

const User = new Schema(
  {
    username: {
      type: String,
      require: true,
      trim: true,
      index: { unique: true },
      minlength: 3,
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
  },
  {
    timestamps: { createdAt: 'created_at' },
  }
);

User.pre('save', async function preSave(next) {
  const user = this;
  console.log('presave');
  console.log(user.password);
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

User.methods.comparePassword = async function comparePassword(candidate) {
  return bcrypt.compare(candidate, this.password);
};

module.exports = mongoose.model('User', User);
