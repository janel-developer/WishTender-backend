const { json } = require('body-parser');
const { use } = require('chai');
const chai = require('chai');
const chaiHttp = require('chai-http');
const { help } = require('../../server/lib/logger');
const wishlists = require('../../server/routes/wishlists');

const should = chai.should();
const helper = require('../helper');
const { validAlias } = require('../helper');

chai.use(chaiHttp);
const url = 'http://localhost:4000';
const { expect } = chai;

const agent = chai.request.agent(url);

describe('add item to user', () => {
  before(async () => helper.before());
  after(async () => helper.after());
  let user;
  let alias;
  let alias2;
  let user2;
  let wishlist;
  let wishlist2;
  let wishlistItem;
  let wishlistItem2;

  context('/users/registration', () => {
    it('creating user', async () => {
      const response = await agent.post('/users/registration').send(helper.validUser);
      user = response.body;
      user.should.be.an('Object');
      user.username.should.equal(helper.validUser.username);
      expect(user.password).to.be.an('undefined');
      user.confirmed.should.be.equal(false);
    });

    it('create other user to test against', async () => {
      const user2Info = { email: 'p@z.com', username: 'user2', password: 'passwordzzz' };
      user2Info.confirmed = true;
      await user2Info;
      const response = await chai.request(url).post('/users/registration').send(user2Info);
      await agent.post('/users/login').send({ email: 'p@z.com', password: 'passwordzzz' });
      user2 = response.body;

      const newAlias = validAlias;
      newAlias.user = user2._id;
      const aliasResp = await agent.post(`/aliases/`).send(newAlias);
      alias2 = aliasResp.body;
      const newWishlist = helper.validWishlist;
      newWishlist.user = user2._id;
      newWishlist.alias = alias2._id;
      const wishlistResp = await agent.post(`/wishlists/`).send(newWishlist);
      wishlist2 = wishlistResp.body;
      const newItem = helper.validWishlistItem;
      newItem.wishlist = wishlist2._id;
      newItem.user = user2._id;
      wishlistItem2 = await agent.post(`/wishlistItems/`).send(newItem);

      wishlist2 = wishlistResp.body;
      wishlist2.alias.toString().should.equal(alias2._id);
      user2.should.be.an('Object');
      user2.should.be.an('Object');
      user2.username.should.equal(user2.username);
      expect(user2.password).to.be.an('undefined');
    });
  });
  context('/users/login', () => {
    it('shouldnt login user before confirming', async () => {
      const response = await agent
        .post('/users/login')
        .send({ email: helper.validUser.email, password: helper.validUser.password });
      const responseText = response.text;
      responseText.should.equal(
        'You were redirected because your login failed: User account not confirmed.'
      );
    });
    it('should confirm a user', async () => {
      const token = await helper.TokenModel.findOne({ user: user._id });
      await agent.get(`/confirmation/${user.email}/${token.token}`);
      const mainUser = await helper.UserModel.findById(user._id);
      mainUser.confirmed.should.be.equal(true);
    });

    it('should login user after confirmed changed to true', async () => {
      const response = await agent
        .post('/users/login')
        .send({ email: helper.validUser.email, password: helper.validUser.password });
      const responseText = response.text;
      responseText.should.equal('Welcome ');
    });
  });
  context('/alias/ post', () => {
    it('add an alias to user', async () => {
      const newAlias = validAlias;
      newAlias.user = user._id;
      newAlias.handle = 'somename';
      const response = await agent.post(`/aliases/`).send(newAlias);
      alias = response.body;

      alias.handle.should.equal(newAlias.handle);
    });
    it('should not edit an alias of another user', async () => {
      const newAlias = validAlias;
      newAlias.user = user2._id;
      const response = await agent.post(`/aliases/`).send(newAlias);
      response.status.should.equal(500);
    });
  });
  context('/alias/:id put', () => {
    it('update alias', async () => {
      const response = await agent.put(`/aliases/${alias._id}`).send({ aliasName: 'dashieboobs' });
      const responseName = response.body.aliasName;
      responseName.should.equal('dashieboobs');
    });
    it(' should not update an alias owned by someone else', async () => {
      const response = await agent
        .put(`/aliases/${alias2._id}`)
        .send({ username: 'dashieBoobies' });
      response.status.should.equal(500); // should actually be 401 not authorized
    });
  });

  context('/wishlists/ post', () => {
    it('should add a wishlist', async () => {
      const body = helper.validWishlist;
      body.alias = alias._id;
      body.user = user._id;
      const response = await agent.post(`/wishlists/`).send(body);
      wishlist = response.body;
      response.body.alias.toString().should.equal(alias._id);
    });
    it('shouldnt add a wishlist to a different users alias', async () => {
      const body = helper.validWishlist;
      body.alias = alias2._id;
      body.user = user2._id;
      const response = await agent.post(`/wishlists/`).send(body);
      response.status.should.equal(500);
    });
  });
  context('/wishlists/ put', () => {
    it('should update a wishlist', async () => {
      const body = { wishlistName: 'newname' };
      const response = await agent.put(`/wishlists/${wishlist._id}`).send(body);
      response.body.wishlistName.toString().should.equal('newname');
    });
    it('shouldnt update a wishlist of a different user', async () => {
      const body = helper.validWishlist;
      body.alias = alias2._id;
      body.user = user2._id;
      const response = await agent.put(`/wishlists/${wishlist2._id}`).send(body);
      response.status.should.equal(500);
    });
  });
  context('/wishlistItems/ post', () => {
    it('should create a wishlistItem', async () => {
      const body = helper.validWishlistItem;
      body.wishlist = wishlist._id;
      body.user = user._id;
      const response = await agent.post(`/wishlistItems/`).send(body);
      wishlistItem = response.body;
      response.body.itemName.should.equal(helper.validWishlistItem.itemName);
    });
    it('shouldnt add a wishlistItem to of a different users wishlist', async () => {
      const body = helper.validWishlist;
      body.alias = alias2._id;
      body.user = user2._id;
      const response = await agent.post(`/wishlists/`).send(body);
      response.status.should.equal(500);
    });
  });
  context('/wishlistItems/ put', () => {
    it('should update a wishlistItem', async () => {
      const body = { itemName: 'newname' };
      const response = await agent.put(`/wishlistItems/${wishlistItem._id}`).send(body);
      response.body.itemName.toString().should.equal('newname');
    });
    it('shouldnt update a wishlist of a different user', async () => {
      const body = { itemName: 'newname' };
      const response = await agent.put(`/wishlistItems/${wishlistItem2._id}`).send(body);
      response.status.should.equal(500);
    });
  });
  context('/wishlistItems/:id delete', () => {
    it('should delete an wishlist item', async () => {
      const response = await agent.delete(`/wishlistItems/${wishlistItem._id}`);
      response.body._id.toString().should.equal(wishlistItem._id);
    });
    it('shouldnt delete a different users wishlist item', async () => {
      const response = await agent.delete(`/wishlistItems/${wishlist2._id}`);
      response.status.should.equal(500);
    });
  });
  context('/wishlists/:id delete', () => {
    it('should delete a wishlist', async () => {
      const response = await agent.delete(`/wishlists/${wishlist._id}`);
      response.body._id.toString().should.equal(wishlist._id);
    });
    it('shouldnt delete a different users wishlist', async () => {
      const response = await agent.delete(`/wishlists/${wishlist2._id}`);
      response.status.should.equal(500);
    });
  });
  context('/aliases/:id delete', () => {
    it('should delete an alias', async () => {
      const response = await agent.delete(`/aliases/${alias._id}`);
      response.body._id.toString().should.equal(alias._id);
    });
    it('shouldnt delete a different users alias', async () => {
      const response = await agent.delete(`/aliases/${alias2._id}`);
      response.status.should.equal(500);
    });
  });
});
