const logger = require('../server/lib/logger');
const User = require('../server/models/User.Model');
const WishlistItem = require('../server/models/WishlistItem.Model');
require('dotenv').config({ path: './backend/.env' }); // why this path?

let UserModel = null;
let WishModel = null;
let TokenModel = null;
let OrderModel = null;
let WishlistModel = null;
let WishlistItemModel = null;
let AliasSchema = null;
let AliasModel = null;
let AliasService = null;
let WishService = null;
let UserService = null;
let WishlistService = null;
let WishlistItemService = null;
let userRoutes = null;
let db = null;

try {
  // eslint-disable-next-line import/no-unresolved
  // eslint-disable-next-line global-require
  db = require('../server/lib/db');
} catch (err) {
  console.log('db ignored');
}
const config = require('../server/config').test;

try {
  // eslint-disable-next-line import/no-unresolved
  // eslint-disable-next-line global-require
  userRoutes = require('../server/routes/users');
} catch (err) {
  console.log('users routes ignored');
}
try {
  // eslint-disable-next-line import/no-unresolved
  // eslint-disable-next-line global-require
  UserModel = require('../server/models/User.Model');
} catch (err) {
  console.log('UserModel ignored');
}
try {
  // eslint-disable-next-line import/no-unresolved
  // eslint-disable-next-line global-require
  OrderModel = require('../server/models/Order.Model');
} catch (err) {
  console.log('OrderModel ignored');
}
try {
  // eslint-disable-next-line import/no-unresolved
  // eslint-disable-next-line global-require
  TokenModel = require('../server/models/Token.Model');
} catch (err) {
  console.log('TokenModel ignored');
}

try {
  // eslint-disable-next-line import/no-unresolved
  // eslint-disable-next-line global-require
  AliasModel = require('../server/models/Alias.Model');
} catch (err) {
  console.log('AliasModel ignored');
}

try {
  // eslint-disable-next-line import/no-unresolved
  // eslint-disable-next-line global-require
  WishlistModel = require('../server/models/Wishlist.Model');
} catch (err) {
  console.log('WishlistModel ignored');
}
try {
  // eslint-disable-next-line import/no-unresolved
  // eslint-disable-next-line global-require
  AliasSchema = require('../server/models/schema/Alias.Schema');
} catch (err) {
  console.log('AliasSchema ignored');
}
try {
  // eslint-disable-next-line import/no-unresolved
  // eslint-disable-next-line global-require
  WishlistItemModel = require('../server/models/WishlistItem.Model');
} catch (err) {
  console.log('WishlistItemModel ignored');
}
try {
  // eslint-disable-next-line import/no-unresolved
  // eslint-disable-next-line global-require
  WishModel = require('../server/models/Wish.Model');
} catch (err) {
  console.log('WishModel ignored');
}
try {
  // eslint-disable-next-line import/no-unresolved
  // eslint-disable-next-line global-require
  WishService = require('../server/services/WishService');
} catch (err) {
  console.log('WishService ignored');
}
try {
  // eslint-disable-next-line import/no-unresolved
  // eslint-disable-next-line global-require
  UserService = require('../server/services/UserService');
} catch (err) {
  console.log('UserService ignored', err);
}
try {
  // eslint-disable-next-line import/no-unresolved
  // eslint-disable-next-line global-require
  AliasService = require('../server/services/AliasService');
} catch (err) {
  console.log('AliasService ignored', err);
}
try {
  // eslint-disable-next-line import/no-unresolved
  // eslint-disable-next-line global-require
  WishlistService = require('../server/services/WishlistService');
} catch (err) {
  console.log('WishlistService ignored');
}

try {
  // eslint-disable-next-line import/no-unresolved
  // eslint-disable-next-line global-require
  WishlistItemService = require('../server/services/WishlistItemService');
} catch (err) {
  console.log('WishlistItemService ignored');
}

/* eslint-disable global-require */
module.exports.before = async () => {
  if (db) {
    await db.connect(config.database.dsn);
  }
  if (UserModel) {
    await WishlistModel.deleteMany({});
    await WishlistItemModel.deleteMany({});
    await UserModel.deleteMany({});
    await AliasModel.deleteMany({});
    await TokenModel.deleteMany({});
  }
  return true;
};
module.exports.after = async () => {
  if (UserModel) {
    await WishlistModel.deleteMany({});
    await WishlistItemModel.deleteMany({});
    await UserModel.deleteMany({});
    await AliasModel.deleteMany({});
    await TokenModel.deleteMany({});
    await OrderModel.deleteMany({});
  }
};

module.exports.validUser = {
  username: 'Frank',
  email: 'frank@acme.org',
  password: 'verysecret',
};
module.exports.validAlias = {
  aliasName: 'Dashie Cutie',
  handle: 'gonnakillya' + Date.now().toString(),
};
module.exports.validWish = {
  //delete later? this is for Wish but we are getting rid of wish
  wish_name: 'purse',
};
module.exports.validWishlistItem = {
  itemName: 'Kion Aminos',
  price: '46.00',
  url: `https://getkion.com/products/kion-aminos-powder`,
  alias: '5f871bbb2e926751b17b2951',
  wishlist: '5f871bbb2e926751b17b2952',
  //add image eventually
};

module.exports.validWishlist = {
  wishlistName: `Dashie's list`,
};

module.exports.createTestUser = async (userInfo = this.validUser) => {
  const user = await UserModel.create(userInfo);
  return user;
};
module.exports.createTestUserFull = async (
  userInfo = this.validUser,
  aliasInfo = this.validAlias,
  wishlistInfo = this.validWishlist,
  itemInfo = this.validWishlistItem
) => {
  const user = await UserModel.create(userInfo);
  user.confirmed = true;
  await user.save();
  delete aliasInfo.user;
  const alias = await AliasModel.create({ user: user._id, ...aliasInfo });
  delete wishlistInfo.user;
  delete wishlistInfo.alias;
  const wishlist = await WishlistModel.create({
    user: user._id,
    alias: alias._id,
    ...wishlistInfo,
  });
  const info = { ...itemInfo };
  delete info.user;
  delete info.alias;
  delete info.wishlist;
  const wishlistItem = await WishlistItem.create({
    user: user._id,
    alias: alias._id,
    wishlist: wishlist._id,
    ...info,
  });
  const wishlistItem2 = await WishlistItem.create({
    user: user._id,
    alias: alias._id,
    wishlist: wishlist._id,
    ...info,
    itemName: 'purse',
  });
  return { user, alias, wishlist, wishlistItems: [wishlistItem, wishlistItem2] };
};

module.exports.sessionIdFromRes = (res) => {
  const setCookieHeader = res.header['set-cookie'][0];
  const regex = /(?<=connect.sid=s%3A)(.*)(?=\.)/g;
  const sessionId = setCookieHeader.match(regex)[0];
  return sessionId;
};

module.exports.userRoutes = userRoutes;
module.exports.UserModel = UserModel;
module.exports.TokenModel = TokenModel;
module.exports.OrderModel = OrderModel;
module.exports.WishModel = WishModel;
module.exports.WishlistModel = WishlistModel;
module.exports.WishlistItemModel = WishlistItemModel;
module.exports.AliasSchema = AliasSchema;
module.exports.AliasModel = AliasModel;
module.exports.config = config;
module.exports.AliasService = AliasService;
module.exports.WishService = WishService;
module.exports.UserService = UserService;
module.exports.WishlistService = WishlistService;
module.exports.WishlistItemService = WishlistItemService;
module.exports.logger = logger;
