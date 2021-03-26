const chai = require('chai');
const chaiHttp = require('chai-http');
const www = require('../../bin/www');

const helper = require('../helper');
const { validAlias } = require('../helper');

chai.use(chaiHttp);
const agent = chai.request.agent(www);

const should = chai.should();
const { expect } = chai;

describe('add item to user', () => {
  before(async () => helper.before());
  after(async () => helper.after());
  let user;
  let alias;
  let alias2;
  let user2;
  let wishlist;
  let wishlistId2;
  let wishlistItem;
  let wishlistItem2;

  context('/api/users/registration', () => {
    it('creating user', async () => {
      const response = await agent.post('/api/users/registration').send(helper.validUser);
      user = response.body;
      user.should.be.an('Object');
      user.email.should.equal(helper.validUser.email);
      expect(user.password).to.be.an('undefined');
      user.confirmed.should.be.equal(false);
    });

    it('create other user to test against', async function () {
      this.timeout(10000);

      // user2
      const user2Info = { email: 'p@z.com', username: 'user2', password: 'passwordzzz' };
      user2Info.confirmed = true;
      await user2Info;
      const response = await chai.request(www).post('/api/users/registration').send(user2Info);
      await agent.post('/api/users/login').send({ email: 'p@z.com', password: 'passwordzzz' });
      user2 = response.body;

      // add alias to user2
      const newAlias = validAlias;
      newAlias.user = user2._id;
      newAlias.country = 'US';
      const aliasResp = await agent.post(`/api/aliases/`).send(newAlias);
      alias2 = aliasResp.body;

      // add item to user2
      wishlistId2 = alias2.wishlists[0];
      const newItem = helper.validWishlistItem;
      newItem.wishlist = wishlistId2;
      newItem.user = user2._id;
      wishlistItem2 = await agent.post(`/api/wishlistItems/`).send(newItem);
      wishlistItem2 = wishlistItem2.body;

      user2.should.be.an('Object');
      user2.email.should.equal(user2.email);
      expect(user2.password).to.be.an('undefined');
    });
  });
  context('/api/users/login', () => {
    it('shouldnt login user before confirming', async () => {
      const response = await agent
        .post('/api/users/login')
        .send({ email: helper.validUser.email, password: helper.validUser.password });
      const responsebody = response.body;
      responsebody.message[0].should.equal('User account not confirmed.');
    });
    it('should redirect user after clicking confirmation link', async () => {
      const token = await helper.TokenModel.findOne({ user: user._id });
      const res = await agent
        .get(`/api/confirmation/${user.email}/${token.token}`)
        .redirects(0)
        .send();

      res.status.should.be.equal(301);
    });
    it('should confirm user', async () => {
      const token = await helper.TokenModel.findOne({ user: user._id });
      const res = await agent.patch(`/api/confirmation/confirm`).send({
        email: user.email,
        token: token.token,
      });

      res.status.should.be.equal(200);
      const mainUser = await helper.UserModel.findById(user._id);
      mainUser.confirmed.should.be.equal(true);
    });

    it('should login user after confirmed changed to true', async () => {
      console.log(user);
      const response = await agent
        .post('/api/users/login')
        .send({ email: helper.validUser.email, password: helper.validUser.password });
      const responseText = response.text;
      responseText.should.equal('{"profile":null}');
    });
  });
  context('/api/alias/ post', () => {
    it('add an alias to user', async () => {
      const newAlias = validAlias;
      newAlias.user = user._id;
      newAlias.handle = 'somename';
      const response = await agent.post(`/api/aliases/`).send(newAlias);
      alias = response.body;

      alias.handle.should.equal(newAlias.handle);
    });
  });
  context('/api/alias/:id patch', () => {
    it('update alias', async () => {
      wishlistId2;
      const response = await agent
        .patch(`/api/aliases/${alias._id}`)
        .send({ aliasName: 'dashieboobs' });
      response.status.should.be.equal(200);
    });
    it(' should not update an alias owned by someone else', async () => {
      const response = await agent
        .patch(`/api/aliases/${alias2._id}`)
        .send({ username: 'dashieBoobies' });
      response.status.should.equal(403);
    });
  });

  context('/wishlists/ post', () => {
    it('should add a wishlist', async () => {
      const body = helper.validWishlist;
      body.alias = alias._id;
      body.user = user._id;
      const response = await agent.post(`/api/wishlists/`).send(body);
      wishlist = response.body;
      response.body.alias.toString().should.equal(alias._id);
    });
    it('shouldnt add a wishlist to a different users alias', async () => {
      const body = helper.validWishlist;
      body.alias = alias2._id;
      body.user = user2._id;
      const response = await agent.post(`/api/wishlists/`).send(body);
      response.status.should.equal(403);
    });
  });
  context('/wishlists/ patch', () => {
    it('should update a wishlist', async () => {
      const body = { wishlistName: 'newname' };
      const response = await agent.patch(`/api/wishlists/${wishlist._id}`).send(body);
      response.status.should.equal(200);
    });
    it('shouldnt update a wishlist of a different user', async () => {
      const body = helper.validWishlist;
      body.alias = alias2._id;
      body.user = user2._id;
      const response = await agent.put(`/api/wishlists/${wishlistId2}`).send(body);
      response.status.should.equal(403);
    });
  });
  context('/wishlistItems/ post', () => {
    it('should create a wishlistItem', async () => {
      const body = helper.validWishlistItem;
      body.wishlist = wishlist._id;
      body.user = user._id;
      const response = await agent.post(`/api/wishlistItems/`).send(body);
      wishlistItem = response.body;
      response.body.itemName.should.equal(helper.validWishlistItem.itemName);
    });
    it('shouldnt add a wishlistItem to a different users wishlist', async () => {
      const body = helper.validWishlistItem;
      body.wishlist = wishlistId2;
      body.user = user2._id;
      const response = await agent.post(`/api/wishlistItems/`).send(body);
      response.status.should.equal(403);
    });
  });
  context('/wishlistItems/ patch', () => {
    it('should update a wishlistItem', async () => {
      const body = { itemName: 'newname' };
      const response = await agent.put(`/api/wishlistItems/${wishlistItem._id}`).send(body);
      response.body.itemName.toString().should.equal('newname');
    });
    it('shouldnt update a wishlist of a different user', async () => {
      const body = { itemName: 'newname' };
      const response = await agent.put(`/api/wishlistItems/${wishlistItem2._id}`).send(body);
      response.status.should.equal(403);
    });
  });
  context('/wishlistItems/:id delete', () => {
    it('should delete an wishlist item', async () => {
      const response = await agent.delete(`/api/wishlistItems/${wishlistItem._id}`);
      response.status.should.equal(204);
    });
    it('shouldnt delete a different users wishlist item', async () => {
      const response = await agent.delete(`/api/wishlistItems/${wishlistItem2._id}`);
      response.status.should.equal(403);
    });
  });
  context('/wishlists/:id delete', () => {
    it('should delete a wishlist', async () => {
      const response = await agent.delete(`/api/wishlists/${wishlist._id}`);
      response.body._id.toString().should.equal(wishlist._id);
    });
    it('shouldnt delete a different users wishlist', async () => {
      const response = await agent.delete(`/api/wishlists/${wishlistId2}`);
      console.log(user);
      response.status.should.equal(403);
    });
  });
  context('/aliases/:id delete', () => {
    it('should delete an alias', async () => {
      const response = await agent.delete(`/api/aliases/${alias._id}`);
      response.body._id.toString().should.equal(alias._id);
    });
    it('shouldnt delete a different users alias', async () => {
      const response = await agent.delete(`/api/aliases/${alias2._id}`);
      response.status.should.equal(403);
    });
  });
});
