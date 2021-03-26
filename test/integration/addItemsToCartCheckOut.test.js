const chai = require('chai');
const MongoClient = require('mongodb');
const chaiHttp = require('chai-http');
const sinon = require('sinon');
const helper = require('../helper');
const www = require('../../bin/www');
const WishlistItem = require('../../server/models/WishlistItem.Model');
const mongoose = require('mongoose');

chai.use(chaiHttp);
const agent = chai.request.agent(www);

const should = chai.should();

describe('add items to cart checkout', () => {
  let db;
  let sessionId;
  let connection;
  before(async () => {
    connection = await MongoClient.connect('mongodb://localhost:27017/test', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    db = await connection.db('test');
  });
  after(async () => {
    if (Object.getPrototypeOf(WishlistItem).findOne.restore)
      Object.getPrototypeOf(WishlistItem).findOne.restore();
  });

  context('add item', () => {
    it('should add item to cart', async function () {
      this.timeout(5000000);

      const itemsToAdd = [
        { alias: { _id: '345' }, price: '4.00', _id: '123' },
        { alias: { _id: '345' }, price: '120.70', _id: '125' },
        { alias: { _id: '300' }, price: '6.00', _id: '122' },
      ];
      const addToCart = async (items) => {
        // eslint-disable-next-line no-async-promise-executor
        await new Promise(async (resolve) => {
          let resolved = 0;
          // eslint-disable-next-line no-restricted-syntax
          for (const item of items) {
            const mockFindOne = {
              populate() {
                return this;
              },
              exec() {
                return item;
              },
            };

            sinon.stub(mongoose.Model, 'findOne').returns(mockFindOne);

            // eslint-disable-next-line no-await-in-loop
            const res = await agent
              .patch('/api/cart/add-to-cart')
              .send({
                itemId: item._id,
              })
              .set('Accept-Language', 'en');

            Object.getPrototypeOf(WishlistItem).findOne.restore();

            resolved += 1;
            if (resolved === items.length) {
              sessionId = helper.sessionIdFromResReq(res);
              resolve();
            }
          }
        });
      };
      await addToCart(itemsToAdd);
      const sessions = db.collection('sessions');
      const results = await sessions.findOne({ _id: sessionId });
      const sessionCart = JSON.parse(results.session).cart;
      sessionCart.aliasCarts[345].totalPrice.should.be.equal(124.7);
    });
    it('should detect language code currency', async () => {
      // why do we keep language code on the backend session while currency is only on the front end cookies? Probably because the browser specifies the language code but the user specifies the currency
      const sessions = db.collection('sessions');
      const results = await sessions.findOne({ _id: sessionId });
      const session = JSON.parse(results.session);
      session.languageCode.should.be.equal('en');
    });
  });
});
