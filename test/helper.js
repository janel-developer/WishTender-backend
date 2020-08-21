let UserModel = null;
let db = null;

try {
  // eslint-disable-next-line import/no-unresolved
  db = require('../../server/lib/db');
} catch (err) {
  console.log('db ignored');
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
  return deleteFilesInDir(config.data.avatars);
};
