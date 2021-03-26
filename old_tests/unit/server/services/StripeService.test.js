/* eslint-disable no-unused-expressions */
const mongoose = require('mongoose');
const chai = require('chai');
const { MongoClient } = require('mongodb');
const StripeService = require('../../../../server/services/StripeService');
const StripeAccountInfoModel = require('../../../../server/models/StripeAccountInfo.Model');
require('dotenv').config();
const stripe = require('stripe')(process.env.STRIPE_SECRET_TEST_KEY);
const helper = require('../../../helper');
const wishlistItems = require('../../../../server/routes/wishlistItems');
const { Cart } = require('../../../../server/models/Cart.Model');

const { expect } = chai;
const should = chai.should();

describe('Stripe Service', () => {
  let connection;
  let db;
  let userId;
  let userId2;
  let wishlistItemId;
  const cart = new Cart({});
  cart.add({ itemName: 'purse', _id: 900, alias: 22, price: 900 });
  before(async () => {
    connection = await MongoClient.connect('mongodb://localhost:27017/test', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    db = await connection.db('test');
    await helper.before();
    await StripeAccountInfoModel.deleteMany({});

    const accounts = db.collection('stripeaccountinfos');
    userId = mongoose.Types.ObjectId('5f9480a69c4fcdc78d55397d');
    userId2 = mongoose.Types.ObjectId('5f9480a69c4fcdc78d55397c');
    const makeMockAccount = async (daysFromNow, user) => {
      const mockAccount = {
        user,
        stripeAccountId: process.env.TEST_EXPRESS_ACCOUNT,
        accountFeeDue: new Date(Date.now() + daysFromNow * 24 * 60 * 60 * 1000),
      };
      await accounts.insertOne(mockAccount);
    };
    await makeMockAccount(2, userId);
    await makeMockAccount(-2, userId2);
    wishlistItemId = mongoose.Types.ObjectId('5f9480a69c4fcdc78d553971');
    const items = db.collection('wishlistitems');
    await items.insertOne({ _id: wishlistItemId });
  });
  after(async () => {
    await StripeAccountInfoModel.deleteMany({});
    await helper.after();
  });
  context('stripeAccountInfoService.isAccountFeeDue()', () => {
    it('should see if account is not due', async () => {
      const stripeService = new StripeService(stripe);
      const isAccountFeeDue = await stripeService.stripeAccountInfoService.isAccountFeeDue(userId);
      isAccountFeeDue.should.be.equal(false);
    });
    it('should see account fee is due', async () => {
      const stripeService = new StripeService(stripe);
      const isAccountFeeDue = await stripeService.stripeAccountInfoService.isAccountFeeDue(userId2);
      isAccountFeeDue.should.be.equal(true);
    });
  });
  context('create line items', () => {
    it('should create line items', () => {
      const aliasCart = cart.aliasCarts['22'];
      const stripeFee = 500;
      const appFee = 1000;
      const lineItems = StripeService.createLineItems(aliasCart, stripeFee, appFee);
      const total = lineItems.reduce(
        (accumulator, item) => parseInt(item.amount, 10) + accumulator,
        0
      );
      total.should.be.equal(stripeFee + appFee + aliasCart.totalPrice);
    });
  });
  context('createStripeSession', () => {
    it('should create session', async () => {
      const stripeService = new StripeService(stripe);
      const lineItems = [
        {
          name: 'WishTender for coffee grinder',
          images: ['https://i.ibb.co/1nBVsqw/gift.png'],
          quantity: 1,
          currency: 'USD',
          amount: 2798,
        },
        {
          name: 'WishTender for hat',
          images: ['https://i.ibb.co/1nBVsqw/gift.png'],
          quantity: 2,
          currency: 'USD',
          amount: 4000,
        },
        {
          name: 'Stripe Fee',
          images: ['https://i.ibb.co/vmfXbyj/stripe.png'],
          quantity: 1,
          currency: 'USD',
          amount: 500,
        },
        {
          name: 'WishTender Fee',
          images: ['https://i.ibb.co/5vQDJFJ/wishtender.png'],
          quantity: 1,
          currency: 'USD',
          amount: 1000,
        },
      ];
      const accountId = process.env.TEST_EXPRESS_ACCOUNT;
      const wishersTender = 4000 + 2798;
      const session = await stripeService.createStripeSession(lineItems, wishersTender, accountId);
      session.payment_status.should.be.equal('unpaid');
    });
  });
  context('fees', () => {
    it('should calculate fees', () => {
      const stripeService = new StripeService(stripe);
      const totalGiftsPrice = 10000;
      const appFeePrct = 10;
      const firstOfMonthCharge = true;
      const fees = new stripeService.Fees(totalGiftsPrice, appFeePrct, firstOfMonthCharge);
      fees.charge.should.equal(11621);
    });
  });
  context('createExpressAccount()', () => {
    it('should create Express Account', async function () {
      this.timeout(10000);
      const info = {
        country: 'US',
        type: 'express',
        capabilities: { transfers: { requested: true } },
      };
      const stripeService = new StripeService(stripe);
      const accountId = await stripeService.createExpressAccount(info);
      await stripe.accounts.del(accountId);
      expect(accountId).to.not.be.null;
      expect(accountId).to.not.be.undefined;
    });
  });
  context('createAccountLink()', () => {
    it('should create an Account link', async function () {
      this.timeout(10000);
      const stripeService = new StripeService(stripe);
      const accountId = await stripeService.createExpressAccount(StripeService.createAccountInfo());
      const link = await stripeService.createAccountLink(accountId);
      await stripe.accounts.del(accountId);
      console.log(link);
      link.slice(0, 46).should.be.equal('https://connect.stripe.com/express/onboarding/');
    });
  });
  context('createLoginLink()', () => {
    it('should create a Login link', async function () {
      this.timeout(10000);
      const stripeService = new StripeService(stripe);
      const loginLink = await stripeService.createLoginLink(process.env.TEST_EXPRESS_ACCOUNT);

      loginLink.slice(0, 35).should.be.equal('https://connect.stripe.com/express/');
    });
  });
  context('checkout()', () => {
    it('should create a checkout session', async function () {
      this.timeout(10000);

      const stripeService = new StripeService(stripe);
      const aliasCart = { ...cart.aliasCarts[22] };
      aliasCart.items[wishlistItemId] = aliasCart.items[900];
      delete aliasCart.items[900];
      aliasCart.user = userId;
      console.log('before session');
      const session = await stripeService.checkoutCart(
        aliasCart,
        'USD',
        process.env.TEST_EXPRESS_ACCOUNT
      );
      session.object.should.be.equal('checkout.session');
    });
  });
});
