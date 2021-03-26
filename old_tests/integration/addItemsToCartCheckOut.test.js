const chai = require('chai');
const MongoClient = require('mongodb');
const chaiHttp = require('chai-http');
const sinon = require('sinon');
const helper = require('../helper');
const www = require('../../bin/www');
const WishlistItem = require('../../server/models/WishlistItem.Model');
console.log('old tests');
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

  context('detect currency and language', () => {
    it('should detect currency', async () => {
      const res = await agent
        .post(`/sessions/locale`)
        .send({ countryCode: 'GB' })
        .set('Accept-Language', 'en');
      sessionId = helper.sessionIdFromRes(res);
      const sessions = db.collection('sessions');
      const results = await sessions.findOne({ _id: sessionId });
      const session = JSON.parse(results.session);
      session.language.should.be.equal('en');
      session.currency.should.be.equal('GBP');
    });
  });
  // context('viewing wishlist items', () => {
  //   it('should get items in correct currency', async () => {
  //     // route to get wishlist items /wishlist/get
  //     const itemsOnWishlist = [
  //       { alias: '345', price: '4.00', _id: '123' },
  //       { alias: '345', price: '120.70', _id: '125' },
  //       { alias: '345', price: '80.99', _id: '125' },
  //     ];
  //     const wishersCurrency = 'CAD';
  //     const aliasCurrency = 'CAD';
  //     const tendersCurrency = 'GBP';
  //   });
  // });
  context('add item', () => {
    it('should add item to cart', async () => {
      const itemsToAdd = [
        { alias: '345', price: '4.00', _id: '123' },
        { alias: '345', price: '120.70', _id: '125' },
        { alias: '300', price: '6.00', _id: '122' },
      ];
      const addToCart = async (items) => {
        // eslint-disable-next-line no-async-promise-executor
        await new Promise(async (resolve) => {
          let resolved = 0;
          // eslint-disable-next-line no-restricted-syntax
          for (const item of items) {
            sinon.stub(Object.getPrototypeOf(WishlistItem), 'findOne').callsFake(() => item);
            // eslint-disable-next-line no-await-in-loop
            await agent.post('/cart/add-to-cart').send({
              itemId: item._id,
            });
            Object.getPrototypeOf(WishlistItem).findOne.restore();
            resolved += 1;
            if (resolved === items.length) {
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
    context('convert price to currency', () => {
      // it('get all cart', async () => {
      // get alias settlement from account info
      // });
    });
  });
});
