// email token
const crypto = require('crypto');
const mongoose = require('mongoose');

const tokenSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
  token: {
    type: String,
    default: () => crypto.randomBytes(16).toString('hex'),
  },
  createdAt: { type: Date, default: Date.now },
  expireAt: { type: Date, default: Date.now, index: { expires: '60m' } },
});

// tokenSchema.path('user').validate(async function (value) {
//   const UserModel = require('./User.Model');
//   const user = await UserModel.findOne({ _id: value });
//   if (!user) {
//     throw new ApplicationError(
//       { user: value },
//       `Invalid email token "user" property. No user found with id: ${value}`
//     );
//   } else {
//     return true;
//   }
// }, 'User non existent');

const Token = mongoose.model('Token', tokenSchema);

module.exports = Token;
