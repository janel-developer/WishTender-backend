const mongoose = require('mongoose');
const chai = require('chai');
const { MongoClient } = require('mongodb');
const StripeAccountInfoService = require('../../../../server/services/StripeAccountInfoService');
const StripeAccountInfoModel = require('../../../../server/models/StripeAccountInfo.Model');
const helper = require('../../../helper');
require('dotenv').config();

const { expect } = chai;
const should = chai.should();

describe('Stripe Express Accounts Service', () => {
  let connection;
  let db;
  let userId;
  let userId2;
  before(async () => {
    connection = await MongoClient.connect('mongodb://localhost:27017/test', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    db = await connection.db('test');
    await helper.before();
    await StripeAccountInfoModel.deleteMany({});

    const orders = db.collection('stripeaccountinfos');
    userId = mongoose.Types.ObjectId('5f9480a69c4fcdc78d55397d');
    userId2 = mongoose.Types.ObjectId('5f9480a69c4fcdc78d55397c');
    const makeMockAccount = async (daysFromNow, user) => {
      const mockAccount = {
        user,
        accountFeeDue: new Date(Date.now() + daysFromNow * 24 * 60 * 60 * 1000),
      };
      await orders.insertOne(mockAccount);
    };
    await makeMockAccount(2, userId);
    await makeMockAccount(-2, userId2);
  });
  after(async () => {
    await StripeAccountInfoModel.deleteMany({});
    helper.after();
  });
  it('should see account fee is not due', async () => {
    const stripeAccountInfoService = new StripeAccountInfoService(StripeAccountInfoModel);
    const isAccountFeeDue = await stripeAccountInfoService.isAccountFeeDue(userId);
    isAccountFeeDue.should.be.equal(false);
  });
  it('should see account fee is due', async () => {
    const stripeAccountInfoService = new StripeAccountInfoService(StripeAccountInfoModel);
    const isAccountFeeDue = await stripeAccountInfoService.isAccountFeeDue(userId2);
    isAccountFeeDue.should.be.equal(true);
  });
});
