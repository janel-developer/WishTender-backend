// add 2 users to the account, delete later
// one will have an item that is the wrong currency
const MongoClient = require('mongodb');
const chai = require('chai');
const chaiHttp = require('chai-http');
const stripe = require('stripe')(process.env.STRIPE_SECRET_TEST_KEY);
const sinon = require('sinon');
const helper = require('../helper');
const Alias = require('../../server/models/Alias.Model');
const Wishlist = require('../../server/models/Wishlist.Model');
const WishlistItem = require('../../server/models/WishlistItem.Model');
const StripeAccountInfo = require('../../server/models/StripeAccountInfo.Model');
const StripeAccountInfoService = require('../../server/services/StripeAccountInfoService');
const StripeService = require('../../server/services/StripeService');
const auth = require('../../server/lib/auth');

const { expect } = chai;

const stripeAccountInfoService = new StripeAccountInfoService(StripeAccountInfo);

const stripeService = new StripeService(stripe);

const should = chai.should();

chai.use(chaiHttp);

describe('connect account create', () => {
  let connection;
  let loggedInUser;
  let user1;
  let user2;
  let alias1;
  let alias2;
  let wishlist1;
  let wishlist2;
  let wishlistItem1;
  const seedTestDatabase = async () => {
    user1 = helper.validUser;
    user1.country = 'GB';
    user1 = await helper.createTestUser(user1);

    const userValues = helper.validUser;
    userValues.email = 'p@fee.com';
    userValues.username = 'peeper';
    userValues.country = 'GB';
    user2 = await helper.createTestUser(userValues);

    // create aliases
    alias1 = new Alias({
      aliasName: 'Ayal Bark-Cohen',
      user: user1._id,
      handle: 'TinyJewBoy',
      currency: 'USD',
      profileImage: '/data/images/profileImages/IMG_9147.jpeg',
    });
    alias2 = new Alias({
      aliasName: 'Dashie Bark-Huss',
      user: user2._id,
      handle: 'babygreeneyes',
      currency: 'USD',
      profileImage: '/data/images/profileImages/IMG_9147.jpeg',
    });

    await alias1.save();
    await user1.aliases.push(alias1._id);
    await user1.save();
    await alias2.save();
    await user2.aliases.push(alias2._id);
    await user2.save();
    wishlist1 = await Wishlist.create({
      wishlistName: "Ayal's Wishes",
      user: user1._id,
      alias: alias1._id,
      wishlistMessage: 'thanks for shopping',
      coverImage: '/data/images/coverImages/IMG_9495.jpeg',
    });
    wishlist2 = await Wishlist.create({
      wishlistName: "Dashies's Wishes",
      user: user2._id,
      alias: alias2._id,
      wishlistMessage: 'thanks for shopping',
      coverImage: '/data/images/coverImages/IMG_9495.jpeg',
    });

    alias1.wishlists.push(wishlist1._id);
    user1.wishlists.push(wishlist1._id);
    await wishlist1.save();
    await alias1.save();
    await user1.save();
    alias2.wishlists.push(wishlist2._id);
    user2.wishlists.push(wishlist2._id);
    await wishlist2.save();
    await alias2.save();
    await user2.save();

    wishlistItem1 = await WishlistItem.create({
      itemName: 'Bottega Veneta ribbed-knit Jumper - Farfetch',
      price: '18000',
      currency: 'USD',
      url:
        'https://www.farfetch.com/shopping/women/bottega-veneta-ribbed-knit-jumper-item-16156077.aspx?storeid=9359',
      wishlist: wishlist1._id,
      itemImage: '/data/images/itemImages/ca9ffc72-9576-4750-97da-d402865ea1ff.png',
      user: user1._id,
      alias: alias1._id,
    });

    wishlist1.wishlistItems.push(wishlistItem1._id);
    await wishlist1.save();
  };

  let accountId1;
  let accountId2;
  let agent;
  let www;
  before(async function () {
    this.timeout(5000000);

    connection = await MongoClient.connect('mongodb://localhost:27017/test', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    db = await connection.db('test');
    await helper.before();
    await seedTestDatabase();
    sinon.stub(auth, 'session').callsFake((req, res, next) => {
      req.user = loggedInUser;
      next();
    });

    www = await require('../../bin/wwwfortesting')();
    agent = chai.request.agent(www.app);
    let accountInfo = { capabilities: { transfers: 'active' } };
    sinon.stub(StripeService.prototype, 'retrieveAccount').returns(accountInfo);
  });

  after(async () => {
    www.server.close();
    auth.session.restore();
    helper.after();

    const deleteAccount = async (user, accountId) => {
      if (!accountId) {
        const account = await stripeAccountInfoService.getAccountByUser(user1._id);
        // eslint-disable-next-line no-param-reassign
        if (account) accountId = account.stripeAccountId;
      }
      if (accountId) await stripeService.deleteAccount(accountId);
    };

    deleteAccount(user1, accountId1);
    deleteAccount(user2, accountId2);
  });

  context('create account', function () {
    it('should not send account link because wrong currency', async function () {
      loggedInUser = user1;
      auth;
      this.timeout(5000000);
      const response = await agent.post('/api/connectAccount/createConnect');
      expect(response.body.error).to.be.equal('Currency Conflict');
    });
    it('shout create account', async function () {
      this.timeout(5000000);
      loggedInUser = user2;
      const response = await agent.post('/api/connectAccount/createConnect');
      expect(response.body).to.have.property('onboardLink');
    });
  });
  context('activate account', async function () {
    it('should activate account', async function () {
      this.timeout(5000000);
      loggedInUser = user2;
      const response = await agent.patch('/api/connectAccount/activateConnect');
      expect(response.status).to.be.equal(201);
    });
    it('should not activate account a second time', async function () {
      this.timeout(5000000);
      loggedInUser = user2;
      const response = await agent.patch('/api/connectAccount/activateConnect');
      expect(response.body.error).to.be.equal('Account Activated');
    });
  });
});
