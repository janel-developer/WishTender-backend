const chai = require('chai');
const sinon = require('sinon');
const chaiHttp = require('chai-http');
const MongoClient = require('mongodb');
const passport = require('passport');
const helper = require('../../../helper');
const { contextsKey } = require('express-validator/src/base');
const { deleteOne } = require('../../../../server/models/User.Model');
const auth = require('../../../../server/lib/auth');
const StripeService = require('../../../../server/services/StripeService');
const AliasService = require('../../../../server/services/AliasService');
const StripeAccountInfoService = require('../../../../server/services/StripeAccountInfoService');
const ItemService = require('../../../../server/services/WishlistItemService');

chai.use(chaiHttp);
const { expect } = chai;
let user = {
  _id: '123',
  aliases: [1234],
  save() {},
};
let accountInfo;
const setUser = sinon.stub(auth, 'session').callsFake((req, res, next) => {
  req.user = user;
  next();
});

let account;

const www = require('../../../../bin/www');
const agent = chai.request.agent(www);

describe('connect account routes', async function () {
  let db;
  let connection;
  before(async () => {
    connection = await MongoClient.connect('mongodb://localhost:27017/test', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    db = await connection.db('test');
  });
  const alias = { save: () => {} };

  context('create account', async () => {
    it('should send a link', async function () {
      sinon.stub(StripeService.prototype, 'createExpressAccount').callsFake((country, email) => {
        account = { id: 'acct_123', country, default_currency: 'gbp', save() {} };
        return account;
      });
      sinon.stub(StripeAccountInfoService.prototype, 'createAccount').callsFake((info) => {
        accountInfo = { _id: '1234', ...info, save() {} };
        return accountInfo;
      });
      sinon.stub(StripeService.prototype, 'createAccountLink').returns('http://example.com');

      sinon.stub(AliasService.prototype, 'getAlias').returns(alias);
      this.timeout(500000);
      const response = await agent
        .post('/api/connectAccount/createConnect')
        .send({ country: 'GB' });
      expect(response.body.onboardLink).to.equal('http://example.com');
    });
    it('should activate the account', async function () {
      this.timeout(500000);
      sinon
        .stub(StripeAccountInfoService.prototype, 'getAccountByUser')
        .callsFake(() => accountInfo);
      sinon.stub(ItemService.prototype, 'wishlistItemsNotCurrency').returns([]);
      sinon.stub(StripeService.prototype, 'retrieveAccount').callsFake(() => {
        account.capabilities = {};
        account.capabilities.transfers = 'active';
        return account;
      });
      const response = await agent.patch('/api/connectAccount/activateConnect');
      expect(response.status).to.equal(201);
    });
  });

  context('not create account because item not correct currency', async () => {
    const incorrectItemCurrencyArray = [{ itemName: 'Shoe', currency: 'USD', price: '2000' }];
    it('should not create account', async function () {
      this.timeout(500000);
      user = {
        _id: '123',
        aliases: [1234],
        save() {},
      };

      ItemService.prototype.wishlistItemsNotCurrency.restore();
      sinon
        .stub(ItemService.prototype, 'wishlistItemsNotCurrency')
        .callsFake(() => incorrectItemCurrencyArray);
      const response = await agent
        .post('/api/connectAccount/createConnect')
        .send({ country: 'GB' });
      expect(response.body.error).to.equal('Currency Conflict');
    });

    it('should correct the currency', async function () {
      this.timeout(500000);
      accountInfo.activated = false;

      sinon.stub(ItemService.prototype, 'correctCurrency').callsFake(() => {
        incorrectItemCurrencyArray.pop();
      });
      const response = await agent
        .patch('/api/connectAccount/correctCurrency')
        .send({ changeValue: true, currency: 'GBP' });
      expect(response.status).to.equal(201);
    });
  });
});
