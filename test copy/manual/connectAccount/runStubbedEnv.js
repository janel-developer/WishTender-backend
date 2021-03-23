const sinon = require('sinon');
const auth = require('../../../server/lib/auth');
const seeder = require('./seeder');
const deseeder = require('../deseeder');
const deleteStripeForUsers = require('./deleteStripe');

const helper = require('../../helper');

(async () => {
  const user = {
    _id: '123',
    aliases: [1234],
    save() {},
  };
  await helper.connect();
  await deleteStripeForUsers();
  await deseeder();
  const seed = await seeder();
  sinon.stub(auth, 'session').callsFake((req, res, next) => {
    req.user = seed.user;
    next();
  });

  // eslint-disable-next-line global-require
  require('../../../bin/www');
})();
