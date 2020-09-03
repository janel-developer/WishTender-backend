let UserModel = null;
let WishModel = null;
let WishService = null;
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
  WishModel = require('../server/models/Wish.Model');
} catch (err) {
  console.log('WishModel ignored');
}
try {
  // eslint-disable-next-line import/no-unresolved
  // eslint-disable-next-line global-require
  WishService = require('../server/services/WishService');
} catch (err) {
  console.log('WishModel ignored');
}

/* eslint-disable global-require */
module.exports.before = async () => {
  if (db) {
    await db.connect(config.database.dsn);
  }
  if (UserModel) {
    return UserModel.deleteMany({});
  }
  return true;
};

module.exports.after = async () => {
  if (UserModel) {
    await UserModel.deleteMany({});
  }
};

module.exports.validUser = {
  username: 'Frank',
  email: 'frank@acme.org',
  password: 'verysecret',
};
module.exports.validWish = {
  wish_name: 'purse',
};

module.exports.UserModel = UserModel;
module.exports.WishModel = WishModel;
module.exports.config = config;
module.exports.WishService = WishService;
