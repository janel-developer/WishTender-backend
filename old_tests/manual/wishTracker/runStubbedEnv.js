const sinon = require('sinon');
const auth = require('../../../server/lib/auth');
const seeder = require('./seeder');
const deseeder = require('../deseeder');

const helper = require('../../helper');

(async () => {
  await helper.connect();
  await deseeder();
  const seed = await seeder();
  sinon.stub(auth, 'session').callsFake((req, res, next) => {
    req.user = seed.user;
    next();
  });

  // eslint-disable-next-line global-require
  require('../../../bin/www');
})();
