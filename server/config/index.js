require('dotenv').config();
const path = require('path');

module.exports = {
  development: {
    sitename: 'WishTender [Developmemt]',
    database: {
      dsn: process.env.DEVELOPMENT_DB_DSN,
    },
  },
  test: {
    sitename: 'WishTender [Test]',
    data: {
      wishes: path.join(__dirname, '../data/wishes.json'),
    },
    database: {
      dsn: process.env.TEST_DB_DSN,
    },
  },
  production: {
    sitename: 'WishTender [PRODUCTION]',
    database: {
      dsn: process.env.PRODUCTION_DB_DSN,
    },
  },
};
