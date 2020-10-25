const mongoose = require('mongoose');
const chai = require('chai');
const { MongoClient } = require('mongodb');
const StripeService = require('../../../../server/services/StripeService');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const helper = require('../../../helper');
require('dotenv').config();

const { expect } = chai;
const should = chai.should();

describe('Stripe Service', () => {
  let connection;
  let db;
  let userId;
  before(async () => {
    connection = await MongoClient.connect('mongodb://localhost:27017/test', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    db = await connection.db('test');
    await helper.before();
    db = await connection.db('test');
    const orders = db.collection('orders');
    userId = mongoose.Types.ObjectId('5f9480a69c4fcdc78d55397d');
    const mockOrder = {
      user: userId,
      createdAt: new Date(Date.now() - 31 * 24 * 60 * 60 * 1000),
    };
    await orders.insertOne(mockOrder);
  });
  after(() => {
    helper.after();
  });
  it('should see if account is activated', async () => {
    const stripeService = new StripeService(stripe);
    const isActivatedAccount = await StripeService.isActivatedAccount(userId);
    isActivatedAccount.should.be.equal(false);
  });
});
