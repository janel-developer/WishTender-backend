const chai = require('chai');
const MongoClient = require('mongodb');
const chaiHttp = require('chai-http');
const sinon = require('sinon');
const helper = require('../helper');
let www;
const WishlistItem = require('../../server/models/WishlistItem.Model');
const mongoose = require('mongoose');
const { expect } = chai;

chai.use(chaiHttp);
let agent;

const should = chai.should();

const itemsToAdd = [
  { alias: { _id: '345' }, price: '400', _id: mongoose.Types.ObjectId('5f9480a69c4fcdc78d55397d') },
  {
    alias: { _id: '345' },
    price: '12070',
    _id: mongoose.Types.ObjectId('5f9480a69c4fcdc78d55397b'),
  },
  { alias: { _id: '300' }, price: '600', _id: mongoose.Types.ObjectId('5f9480a69c4fcdc78d55397c') },
  { alias: { _id: '300' }, price: '600', _id: mongoose.Types.ObjectId('5f9480a69c4fcdc78d55397c') },
];

describe('cart add and remove items', () => {
  let db;
  let sessionId;
  let connection;
  before(async () => {
    www = await require('../../bin/wwwfortesting')();
    agent = chai.request.agent(www.app);
    connection = await MongoClient.connect('mongodb://localhost:27017/test', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    db = await connection.db('test');
  });
  after(async () => {
    www.server.close();
    if (Object.getPrototypeOf(WishlistItem).findOne.restore)
      Object.getPrototypeOf(WishlistItem).findOne.restore();
  });
  context('remove item', () => {
    it('should error 400 because no cart', async () => {
      const res = await agent
        .patch('/api/cart/remove-from-cart')
        .send({
          itemId: itemsToAdd[0]._id,
        })
        .set('Accept-Language', 'en');

      res.status.should.be.equal(400);
      res.body.message.should.be.equal('No Cart.');
    });
  });
  context('reduce item', () => {
    it('should error 400 because no cart', async () => {
      const res = await agent
        .patch('/api/cart/reduce')
        .send({
          itemId: itemsToAdd[0]._id,
        })
        .set('Accept-Language', 'en');

      res.status.should.be.equal(400);
      res.body.message.should.be.equal('No Cart.');
    });
  });
  context('get cart', () => {
    it('should return no body', async () => {
      const res = await agent.get('/api/cart/');

      res.status.should.be.equal(200);
      // eslint-disable-next-line no-unused-expressions
      expect(res.body.aliasCarts).to.not.exist;
    });
  });

  context('add item', () => {
    it('should add item to cart', async function () {
      this.timeout(5000000);

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
                itemId: item._id.toString(),
              })
              .set('Accept-Language', 'en');
            res.status.should.be.equal(201);

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
      sessionCart.aliasCarts[345].totalPrice.should.be.equal(12470);
    });
    it('should detect language code currency', async () => {
      // why do we keep language code on the backend session while currency is only on the front end cookies? Probably because the browser specifies the language code but the user specifies the currency
      const sessions = db.collection('sessions');
      const results = await sessions.findOne({ _id: sessionId });
      const session = JSON.parse(results.session);
      session.languageCode.should.be.equal('en');
    });

    it('should error if no item sent', async () => {
      const res = await agent.patch('/api/cart/add-to-cart').send({}).set('Accept-Language', 'en');

      res.status.should.be.equal(400);
      res.body.errors[0].msg.should.be.equal('No item id included.');
    });
    it("should error if item doesn't exist", async () => {
      const res = await agent
        .patch('/api/cart/add-to-cart')
        .send()
        .set('Accept-Language', 'en')
        .send({ itemId: '1234' });
      res.status.should.be.equal(400);
      res.body.message.should.be.equal('Item id not valid.');
    });
    it("should error if item doesn't exist", async () => {
      const res = await agent
        .patch('/api/cart/add-to-cart')
        .send()
        .set('Accept-Language', 'en')
        .send({ itemId: '5f9480a69c4fcdc78d55397b' });
      res.status.should.be.equal(400);
      res.body.message.should.be.equal("Item doesn't exist.");
    });
  });
  context('remove item', () => {
    it('should remove item', async () => {
      const res = await agent
        .patch('/api/cart/remove-from-cart')
        .send({
          itemId: itemsToAdd[0]._id,
        })
        .set('Accept-Language', 'en');
      const sessions = db.collection('sessions');
      const results = await sessions.findOne({ _id: sessionId });
      const sessionCart = JSON.parse(results.session).cart;
      sessionCart.aliasCarts[345].totalPrice.should.be.equal(12070);
      res.status.should.be.equal(200);
    });
    it('should remove cart when no items are left', async () => {
      const res = await agent
        .patch('/api/cart/remove-from-cart')
        .send({
          itemId: itemsToAdd[1]._id,
        })
        .set('Accept-Language', 'en');
      const sessions = db.collection('sessions');
      const results = await sessions.findOne({ _id: sessionId });
      const sessionCart = JSON.parse(results.session).cart;

      res.status.should.be.equal(200);
      // eslint-disable-next-line no-unused-expressions
      expect(sessionCart.aliasCarts[345]).to.not.exist;
    });
    it("should not do anything if the item the user is trying to delete doesn't exist", async () => {
      const res = await agent
        .patch('/api/cart/remove-from-cart')
        .send({
          itemId: itemsToAdd[1]._id,
        })
        .set('Accept-Language', 'en');
      const sessions = db.collection('sessions');
      const results = await sessions.findOne({ _id: sessionId });
      const sessionCart = JSON.parse(results.session).cart;
      res.status.should.be.equal(200);
    });
    it('should reduce item and no alias cart left', async () => {
      const res = await agent
        .patch('/api/cart/remove-from-cart')
        .send({})
        .set('Accept-Language', 'en');

      res.status.should.be.equal(400);

      // eslint-disable-next-line no-unused-expressions
      res.body.errors[0].msg.should.be.equal('No item id included.');
    });
  });
  context('reduce item', () => {
    it('should reduce item', async () => {
      const res = await agent
        .patch('/api/cart/reduce')
        .send({
          itemId: itemsToAdd[3]._id,
        })
        .set('Accept-Language', 'en');

      res.status.should.be.equal(200);
      res.body.aliasCarts[300].totalPrice.should.be.equal(600);
    });
    it('should reduce item and no alias cart left', async () => {
      const res = await agent
        .patch('/api/cart/reduce')
        .send({
          itemId: itemsToAdd[3]._id,
        })
        .set('Accept-Language', 'en');

      res.status.should.be.equal(200);

      // eslint-disable-next-line no-unused-expressions
      expect(res.body.aliasCarts[300]).to.not.exist;
    });
    it('should return 200 when reduce if no alias cart left', async () => {
      const res = await agent
        .patch('/api/cart/reduce')
        .send({
          itemId: itemsToAdd[3]._id,
        })
        .set('Accept-Language', 'en');

      res.status.should.be.equal(200);

      // eslint-disable-next-line no-unused-expressions
      expect(res.body.aliasCarts[300]).to.not.exist;
    });
    it('should reduce item and no alias cart left', async () => {
      const res = await agent.patch('/api/cart/reduce').send({}).set('Accept-Language', 'en');

      res.status.should.be.equal(400);

      // eslint-disable-next-line no-unused-expressions
      res.body.errors[0].msg.should.be.equal('No item id included.');
    });
  });
  context('get cart', () => {
    it('should return cart', async () => {
      const res = await agent.get('/api/cart/');

      res.status.should.be.equal(200);
      // eslint-disable-next-line no-unused-expressions
      expect(res.body.aliasCarts).to.exist;
    });
  });
});
