const mongoose = require('mongoose');

const chai = require('chai');
const { MongoClient } = require('mongodb');
const Order = require('../../../../server/models/Order.Model');

const OrderService = require('../../../../server/services/OrderService');
const helper = require('../../../helper');

require('dotenv').config();

const { expect } = chai;
const should = chai.should();
const orderService = new OrderService(Order);

describe('Order Service', () => {
  let user;
  let user2;
  let connection;
  let db;
  before(async () => {
    connection = await MongoClient.connect('mongodb://localhost:27017/test', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    db = await connection.db('test');

    await helper.before();
    Order.deleteMany({});
    // user = await helper.createTestUser();
    // const userValues = helper.validUser;
    // userValues.email = 'p@fee.com';
    // userValues.username = 'peeper';
    // user2 = await helper.createTestUser(userValues);
  });
  after(() => {
    helper.after();
    Order.deleteMany({});
  });
  // it('should create an order', async () => {
  //   const item = helper.validWishlistItem;
  //   item.user = user._id;
  //   const order = await orderService.createOrder(item, '4.00', '40.00', '00.40', 'Stripe', {
  //     name: 'Bambi',
  //   });
  //   order.wishlistItemInfo.itemName.should.be.equal(helper.validWishlistItem.itemName);
  // });
  // it(`should find user's orders`, async () => {
  //   const item2 = helper.validWishlistItem;
  //   item2.user = user._id;
  //   item2.itemName = 'blue hat';
  //   await orderService.createOrder(item2, '4.00', '40.00', '00.40', 'Stripe', {
  //     name: 'bob',
  //   });

  //   const item3 = helper.validWishlistItem;
  //   item3.user = user2._id;
  //   item3.itemName = 'brown hat';
  //   await orderService.createOrder(item3, '4.00', '40.00', '00.40', 'Stripe', {
  //     name: 'bob',
  //   });

  //   const orders = await orderService.getOrdersByUser(user._id);
  //   orders.length.should.be.equal(2);
  // });
  it('should tell if didGetOrderLast30Days', async () => {
    db = await connection.db('test');
    const orders = db.collection('orders');

    const userId = mongoose.Types.ObjectId('5f9480a69c4fcdc78d55397d');
    const userId2 = mongoose.Types.ObjectId('5f9480a69c4fcdc78d553971');
    const mockOrder1 = {
      user: userId,
      createdAt: new Date(Date.now() - 29 * 24 * 60 * 60 * 1000),
    };

    const mockOrder2 = {
      user: userId2,
      createdAt: new Date(Date.now() - 31 * 24 * 60 * 60 * 1000),
    };

    await orders.insertOne(mockOrder1);
    await orders.insertOne(mockOrder2);

    const didGetOrderRecently = await orderService.didGetOrderLast30Days(userId);
    const didNotGetOrderRecently = await orderService.didGetOrderLast30Days(userId2);

    didGetOrderRecently.should.be.equal(true);
    didNotGetOrderRecently.should.be.equal(false);
  });
});
