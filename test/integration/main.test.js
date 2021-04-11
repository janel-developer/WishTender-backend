const chai = require('chai');
const chaiHttp = require('chai-http');
const sinon = require('sinon');
const helper = require('../helper');
const Email = require('../../server/lib/email/Email');
const StripeService = require('../../server/services/StripeService');
const { expect } = require('chai');
const s3 = require('../../server/lib/s3/s3');
const should = chai.should();
chai.use(chaiHttp);

let www;
let wisherUS;
let gifter;
let item;
let jeansId;
let purseId;
let candyId;
let alias;
let email;
const testStripeAccountUS = 'acct_1IaWXDPvC6FHr3i8';

describe('wisher flow', () => {
  before(async function () {
    this.timeout(7000);
    sinon.stub(Email.prototype, 'send').callsFake(function fakeFn() {
      const arr = this.html.match(/(?<=confirmation\/)(.*)(?=">Confirm<)/g)[0].split('/');
      email = { email: arr[0], token: arr[1] };
    });
    sinon
      .stub(StripeService.prototype, 'createExpressAccount')
      .returns({ id: testStripeAccountUS, default_currency: 'usd', country: 'US' });

    await helper.before();
    const result = await s3.clearBucketS3();
    www = await require('../../bin/wwwfortesting')();
    wisherUS = chai.request.agent(www.app);
    gifter = chai.request.agent(www.app);
  });
  after(async () => {
    const result = await s3.clearBucketS3();
    await www.server.close();
    await helper.after();
    if (wisherUS) wisherUS.close();
    if (gifter) gifter.close();
  });

  context('user:wisher 1', () => {
    it('should create account', async () => {
      const res = await wisherUS
        .post('/api/users/registration')
        .send({ email: 'dash@wishy.com', password: 'abcde1234' });
      res.status.should.be.equal(201);
    });
    it('should set up account', async () => {
      const res = await wisherUS
        .post('/api/aliases')
        .send({ country: 'US', aliasName: 'Dashie Bark-Huss', handle: 'DashieWashie' });
      alias = res.body;
      res.status.should.be.equal(201);
    });
    it('should add profile picture', async function () {
      this.timeout(7000);
      const res = await wisherUS
        .patch(`/api/aliases/${alias._id}`)
        .set('Content-Type', 'multipart/form-data')
        .attach(
          'image',
          '/Users/dashiellbarkhuss/Documents/gift_registry_business_idea/react app/backend/test/integration/test_image.png',
          'test_image.png'
        );
      res.status.should.be.equal(200);
    });
    it('should add cover picture', async function () {
      this.timeout(7000);
      const res = await wisherUS
        .patch(`/api/wishlists/${alias.wishlists[0]}`)
        .set('Content-Type', 'multipart/form-data')
        .attach(
          'image',
          '/Users/dashiellbarkhuss/Documents/gift_registry_business_idea/react app/backend/test/integration/test_image.png',
          'test_image.png'
        );
      res.status.should.be.equal(200);
    });
    it('should edit wishlist message', async function () {
      this.timeout(7000);
      const res = await wisherUS
        .patch(`/api/wishlists/${alias.wishlists[0]}`)
        .send({ wishlistMessage: 'Awesome' });
      res.status.should.be.equal(200);
    });
    it('should add item', async function () {
      this.timeout(7000);
      const res = await wisherUS.post(`/api/wishlistItems`).send({
        itemName: 'Saint Laurent mid-rise straight-leg Jeans - Farfetch',
        price: '85000',
        imageCrop: {
          crop: { width: 480, height: 480, x: 0, y: 0 },
          url: 'https://cdn-images.farfetch-contents.com/15/87/78/29/15877829_32396120_480.jpg',
        },
        url:
          'https://www.farfetch.com/shopping/women/saint-laurent-mid-rise-straight-leg-jeans-item-15877829.aspx?storeid=9359',
        currency: 'USD',
        wishlist: alias.wishlists[0],
      });
      jeansId = res.body._id;
      res.status.should.be.equal(201);
    });
    let earringsId;
    it('should add 2nd item', async function () {
      this.timeout(7000);
      const res = await wisherUS.post(`/api/wishlistItems`).send({
        itemName: 'Awesome Earrings ',
        price: '40900',
        imageCrop: {
          crop: { width: 480, height: 480, x: 0, y: 11 },
          url: 'https://cdn-images.farfetch-contents.com/16/52/85/70/16528570_32324453_480.jpg',
        },
        url:
          'https://www.farfetch.com/shopping/women/area-fringed-crystal-earrings-item-16528570.aspx?storeid=10507',
        currency: 'USD',
        wishlist: alias.wishlists[0],
      });
      earringsId = res.body._id;
      res.status.should.be.equal(201);
    });
    it('should add 3rd item', async function () {
      this.timeout(7000);
      const res = await wisherUS.post(`/api/wishlistItems`).send({
        itemName: 'Candy',
        price: '1000',
        imageCrop: {
          crop: { width: 480, height: 480, x: 0, y: 11 },
          url: 'https://cdn-images.farfetch-contents.com/16/52/85/70/16528570_32324453_480.jpg',
        },
        url:
          'https://www.farfetch.com/shopping/women/area-fringed-crystal-earrings-item-16528570.aspx?storeid=10507',
        currency: 'USD',
        wishlist: alias.wishlists[0],
      });
      candyId = res.body._id;
      res.status.should.be.equal(201);
    });
    it('should add 4th item', async function () {
      this.timeout(7000);
      const res = await wisherUS.post(`/api/wishlistItems`).send({
        itemName: 'purse',
        price: '5000',
        imageCrop: {
          crop: { width: 480, height: 480, x: 0, y: 11 },
          url: 'https://cdn-images.farfetch-contents.com/16/52/85/70/16528570_32324453_480.jpg',
        },
        url:
          'https://www.farfetch.com/shopping/women/area-fringed-crystal-earrings-item-16528570.aspx?storeid=10507',
        currency: 'USD',
        wishlist: alias.wishlists[0],
      });
      purseId = res.body._id;
      res.status.should.be.equal(201);
    });
    it('should update item', async function () {
      this.timeout(10000);
      const res = await wisherUS
        .patch(`/api/wishlistItems/${earringsId}`)
        .field('itemName', 'Sparkly Earrings')
        .field('price', '41000')
        .attach(
          'image',
          '/Users/dashiellbarkhuss/Documents/gift_registry_business_idea/react app/backend/test/integration/test_image.png',
          'test_image.png'
        );
      res.status.should.be.equal(200);
    });
    it('should delete item', async () => {
      const res = await wisherUS.delete(`/api/wishlistItems/${earringsId}`);
      res.status.should.be.equal(204);
    });
  });
  context('user: gifter', () => {
    it('should not get wishlist items in alias request', async () => {
      const res = await gifter.get(`/api/aliases?handle_lowercased=dashiewashie`);
      res.body.wishlists[0].wishlistItems.length.should.be.equal(0);
      res.status.should.be.equal(200);
    });
    it('should not get wishlist in wishlist request', async () => {
      const res = await gifter.get(`/api/wishlists/${alias.wishlists[0]}`);
      res.status.should.be.equal(401);
    });
    it('should not add an item to cart', async () => {
      const res = await gifter.patch(`/api/cart/add-to-cart`).send({ itemId: jeansId });
      res.status.should.be.equal(400);
      res.body.message.should.be.equal(
        'This item is not available because the user who posted the item has not activated their account.'
      );
    });
  });
  context('user: wisher1', () => {
    it('should not create onboard link', async () => {
      const res = await wisherUS.post('/api/connectAccount/createConnect').send({});
      res.status.should.be.equal(403);
      res.body.message.should.be.equal('User email not confirmed.');
    });
    it('should forward to frontend form', async () => {
      const res = await wisherUS
        .get(`/api/confirmation/${email.email}/${email.token}`)
        .redirects(0)
        .send();
      res.status.should.be.equal(302);
    });
    it('should confirm email', async () => {
      const res = await wisherUS
        .patch('/api/confirmation/confirm')
        .send({ email: email.email, token: email.token });
      res.status.should.be.equal(200);
    });
    it('should create onboard link', async function () {
      this.timeout(5000);
      const res = await wisherUS.post('/api/connectAccount/createConnect').send({});
      // in real life the user would follow the onboarding link and complete set up
      // but in this test, the stripe account id is stubbed with an already set up account
      res.status.should.be.equal(200);
      res.body.onboardLink
        .slice(0, 46)
        .should.be.equal('https://connect.stripe.com/express/onboarding/');
    });
    it('should activate account', async function () {
      const res = await wisherUS.patch('/api/connectAccount/activateConnect');
      res.status.should.be.equal(200);
    });
  });
  context('user: gifter', () => {
    it('should get wishlist items in alias request', async () => {
      const res = await gifter.get(`/api/aliases?handle_lowercased=dashiewashie`);
      res.body.wishlists[0].wishlistItems.length.should.not.be.equal(0);
      res.status.should.be.equal(200);
    });
    it('should not get wishlist in wishlist request', async () => {
      const res = await gifter.get(`/api/wishlists/${alias.wishlists[0]}`);
      res.status.should.be.equal(401);
    });
    it('should add jeans to cart', async () => {
      const res = await gifter.patch(`/api/cart/add-to-cart`).send({ itemId: jeansId });
      res.status.should.be.equal(201);
    });
    it('should add candy to cart', async () => {
      const res = await gifter.patch(`/api/cart/add-to-cart`).send({ itemId: candyId });
      res.status.should.be.equal(201);
    });
    it('should add 1st purse to cart', async () => {
      const res = await gifter.patch(`/api/cart/add-to-cart`).send({ itemId: purseId });
      res.status.should.be.equal(201);
    });
    it('should add 2nd purse to cart', async () => {
      const res = await gifter.patch(`/api/cart/add-to-cart`).send({ itemId: purseId });
      res.body.aliasCarts[alias._id].totalPrice.should.be.equal(96000);
      res.body.aliasCarts[alias._id].totalQty.should.be.equal(4);
      res.status.should.be.equal(201);
    });
    it('should reduce an 1 purse from cart', async () => {
      const res = await gifter.patch(`/api/cart/reduce`).send({ itemId: purseId });
      res.body.aliasCarts[alias._id].totalPrice.should.be.equal(91000);
      res.body.aliasCarts[alias._id].totalQty.should.be.equal(3);
      res.body.aliasCarts[alias._id].items[purseId].qty.should.be.equal(1);
      res.status.should.be.equal(200);
    });
    it('should reduce an 1 purse from cart', async () => {
      const res = await gifter.patch(`/api/cart/reduce`).send({ itemId: purseId });
      res.body.aliasCarts[alias._id].totalPrice.should.be.equal(86000);
      res.body.aliasCarts[alias._id].totalQty.should.be.equal(2);
      // eslint-disable-next-line no-unused-expressions
      expect(res.body.aliasCarts[alias._id].items[purseId]).to.not.exist;
    });
    it('should add candy to cart', async () => {
      const res = await gifter.patch(`/api/cart/add-to-cart`).send({ itemId: candyId });
      res.status.should.be.equal(201);
    });
    it('should remove all candy candy to cart', async () => {
      const res = await gifter.patch(`/api/cart/remove-from-cart`).send({ itemId: candyId });
      res.status.should.be.equal(200);
      expect(res.body.aliasCarts[alias._id].items[candyId]).to.not.exist;
    });
    it('should add 1 candy back to cart', async () => {
      const res = await gifter.patch(`/api/cart/add-to-cart`).send({ itemId: candyId });
      res.status.should.be.equal(201);
    });

    it('should get cart', async () => {
      const res = await gifter.get('/api/cart/');
      res.status.should.be.equal(200);
      // eslint-disable-next-line no-unused-expressions
      expect(res.body.aliasCarts).to.exist;
    });
    it('should not allow checkout without currency set', async () => {
      const res = await gifter.post('/api/checkout').send({
        alias: alias._id,
        order: {
          buyerInfo: { email: 'dashiellbarkhuss@gmail.com', fromLine: 'Dash' },
          noteToWisher: 'Thank you you for being the best author if short stories.',
        },
      });
      res.status.should.be.equal(400);
      // eslint-disable-next-line no-unused-expressions
    });
    it('should detect locale and send set-cookie header to help front end suggest currencies', async () => {
      const res = await gifter.get('/').set('Accept-Language', 'en-US');
      const parseCookies = (c) => {
        const str = decodeURIComponent(c).split('; ');
        const result = {};
        for (let i = 0; i < str.length; i++) {
          const cur = str[i].split('=');
          result[cur[0]] = cur[1];
        }
        return result;
      };
      // helper.sessionIdFromRes(res);
      const p = parseCookies(res.headers['set-cookie']);
      const locale = JSON.parse(p.locale);
      // eslint-disable-next-line no-unused-expressions
      locale.countryCode.should.equal('US');
      locale.locale.should.equal('en-US');
      locale.languageCode.should.equal('en');
    });
    it('should create checkout session', async () => {
      gifter.jar.setCookie('currency=USD');
      const res = await gifter
        .post('/api/checkout')
        .set('Cookie', 'currency=USD; Domain=localhost')
        .send({
          alias: alias._id,
          order: {
            buyerInfo: { email: 'dashiellbarkhuss@gmail.com', fromLine: 'Dash' },
            noteToWisher: 'Thank you you for being the best author if short stories.',
          },
        });

      // eslint-disable-next-line no-unused-expressions
      expect(res.body.checkoutSessionId).to.exist;
    });
  });
});
