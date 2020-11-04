const chai = require('chai');
const chaiHttp = require('chai-http');
const sinon = require('sinon');
const www = require('../../../../bin/www');
const WishlistItem = require('../../../../server/models/WishlistItem.Model');
const MongoClient = require('mongodb');
const helper = require('../../../helper');

const should = chai.should();

chai.use(chaiHttp);
const agent = chai.request.agent(www);

describe('cart routes', () => {
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
    Object.getPrototypeOf(WishlistItem).findOne.restore();
  });

  context('cart', () => {
    it('should add item to req.session.cart', async () => {
      const item = { alias: 'debbie', price: '4.00', _id: '123' };
      sinon.stub(Object.getPrototypeOf(WishlistItem), 'findOne').callsFake(() => item);
      const res = await agent.post('/cart/add-to-cart').send({
        itemId: '123',
      });
      sessionId = helper.sessionIdFromRes(res);
      const sessions = db.collection('sessions');
      const results = await sessions.findOne({ _id: sessionId });
      const sessionCart = JSON.parse(results.session).cart;
      sessionCart.aliasCarts.debbie.totalPrice.should.be.equal(4);
    });
    it('should add another item to req.session.cart', async () => {
      const item = { alias: 'debbie', price: '7.00', _id: '125' };
      Object.getPrototypeOf(WishlistItem).findOne.restore();

      sinon.stub(Object.getPrototypeOf(WishlistItem), 'findOne').callsFake(() => item);
      await agent.post('/cart/add-to-cart').send({
        itemId: '125',
      });
      const sessions = db.collection('sessions');
      const results = await sessions.findOne({ _id: sessionId });
      const sessionCart = JSON.parse(results.session).cart;
      sessionCart.aliasCarts.debbie.totalPrice.should.be.equal(11);
    });
    it('should remove item from req.session.cart', async () => {
      const sessions = db.collection('sessions');

      await sessions.update(
        {
          _id: sessionId,
        },
        {
          session:
            '{"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"},"visits":2,"cart":{"aliasCarts":{"debbie":{"items":{"123":{"item":{"alias":"debbie","price":"4.00","_id":"123"},"qty":2,"price":8},"125":{"item":{"alias":"debbie","price":"7.00","_id":"125"},"qty":1,"price":7}},"totalQty":3,"totalPrice":15}}}}',
        }
      );
      await agent.post('/cart/remove-from-cart').send({
        itemId: '123',
        aliasId: 'debbie',
      });
      const results = await sessions.findOne({ _id: sessionId });
      const sessionCart = JSON.parse(results.session).cart;
      sessionCart.aliasCarts.debbie.totalPrice.should.be.equal(7);
    });
    it('should reduce item by on in req.session.cart', async () => {
      const sessions = db.collection('sessions');

      await sessions.update(
        {
          _id: sessionId,
        },
        {
          session:
            '{"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"},"visits":2,"cart":{"aliasCarts":{"debbie":{"items":{"123":{"item":{"alias":"debbie","price":"4.00","_id":"123"},"qty":2,"price":8},"125":{"item":{"alias":"debbie","price":"7.00","_id":"125"},"qty":1,"price":7}},"totalQty":3,"totalPrice":15}}}}',
        }
      );
      await agent.post('/cart/reduce').send({
        itemId: '123',
        aliasId: 'debbie',
      });
      const results = await sessions.findOne({ _id: sessionId });
      const sessionCart = JSON.parse(results.session).cart;
      sessionCart.aliasCarts.debbie.totalPrice.should.be.equal(11);
    });
  });
});
