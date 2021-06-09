const mongoose = require('mongoose');
const { ApplicationError } = require('../lib/Error');
const softDelete = require('mongoosejs-soft-delete');
const mongoose_delete = require('mongoose-delete');

const aliasSchema = new mongoose.Schema(
  {
    aliasName: String,
    handle: {
      type: String,
      // unique: true,
      index: { unique: true, partialFilterExpression: { deleted: false } },
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    wishlists:
      // reference, one-to-many
      [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Wishlist',
        },
      ],
    profileImage: { type: String },
    handle_lowercased: {
      type: String,
      // unique: true,
      index: { unique: true, partialFilterExpression: { deleted: false } },
    },
    currency: { type: String, required: true },
    // country: { type: String, required: true },
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

// in the future if there are miltiple aliases and a route to delete them.
// aliasSchema.pre('remove', async function (next) {
//   const UserModel = require('./User.Model');
//   const WishlistModel = require('./Wishlist.Model');
//   const user = await UserModel.findById(this.user);
//   if (user) {
//     user.aliases.pull(this._id);
//     await user.save();
//   }
//   const wishlists = await WishlistModel.find({ alias: this._id });
//   await wishlists.forEach((al) => al.remove());
//   next();
// });

aliasSchema.pre('save', async function (next) {
  if (this.isModified('handle_lowercased')) {
    throw new Error('handle_lowercased cannot be manually modified');
  }
  this.handle_lowercased = this.handle.toLowerCase();
  next();
});

// aliasSchema.path('handle_lowercased').validate(async function (value) {
//   if (value !== this.handle.toLowerCase()) {
//     throw new ApplicationError(
//       { handle_lowercased: value },
//       `Invalid Alias "handle_lowercased" property. Must be lowercase of ${this.handle}`
//     );
//   } else {
//     return true;
//   }
// }, '"handle_lowercased" not lower case of handle');

aliasSchema.path('user').validate(async function (value) {
  try {
    const UserModel = require('./User.Model');

    const user = await UserModel.findOne({ _id: value });
    const all = await UserModel.find();
    if (!user) {
      throw new ApplicationError(
        { user: value },
        `Invalid Alias "user" property. No user found with id: ${value}`
      );
    } else {
      return true;
    }
  } catch (error) {
    throw new ApplicationError({}, `Can't validate User on Alias: ${error}`);
  }
}, 'Parent User non existent');
// aliasSchema.plugin(softDelete);
aliasSchema.plugin(mongoose_delete, {
  indexFields: ['deletedAt'],
  overrideMethods: 'all',
  validateBeforeDelete: false,
});

const Alias = mongoose.model('Alias', aliasSchema);
module.exports = Alias;
