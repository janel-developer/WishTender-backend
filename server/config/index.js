require('dotenv').config();

module.exports = {
  development: {
    sitename: 'WishTender [Developmemt]',
    database: {
      dsn: process.env.DEVELOPMENT_DB_DSN,
    },
  },
  test: {
    sitename: 'WishTender [Test]',
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
