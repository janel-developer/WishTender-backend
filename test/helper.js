const logger = require('../server/lib/logger');

let UserModel = null;
let WishModel = null;
let WishlistModel = null;
let WishlistItemModel = null;
let AliasSchema = null;
let WishService = null;
let WishlistItemService = null;
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
  UserModel = require('../server/models/User.Model');
} catch (err) {
  console.log('UserModel ignored');
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
  }
  return true;
};

module.exports.after = async () => {
  if (UserModel) {
    await WishlistModel.deleteMany({});
    await WishlistItemModel.deleteMany({});
    await UserModel.deleteMany({});
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
  //add image eventually
};
module.exports.validWishlist = {
  wishlistName: `Dashie's list`,
};

module.exports.UserModel = UserModel;
module.exports.WishModel = WishModel;
module.exports.WishlistModel = WishlistModel;
module.exports.WishlistItemModel = WishlistItemModel;
module.exports.AliasSchema = AliasSchema;
module.exports.config = config;
module.exports.WishService = WishService;
module.exports.WishlistItemService = WishlistItemService;
module.exports.logger = logger;
