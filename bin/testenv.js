const sinon = require('sinon');
const auth = require('../server/lib/auth');

const user = {
  _id: '123',
  aliases: [1234],
  save() {},
};
sinon.stub(auth, 'session').callsFake((req, res, next) => {
  req.user = user;
  next();
});
require('./www');
