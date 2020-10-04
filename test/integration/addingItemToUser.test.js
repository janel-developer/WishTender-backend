const { json } = require('body-parser');
const chai = require('chai');
const chaiHttp = require('chai-http');

const should = chai.should();
const helper = require('../helper');
const { validAlias } = require('../helper');

chai.use(chaiHttp);
const url = 'http://localhost:4000';
const { expect } = chai;

var agent = chai.request.agent(url);

describe('user routes', () => {
  before(async () => helper.before());
  after(async () => helper.after());
  let user;
  let alias;
  let alias2;
  let user2;

  describe('/users/registration', () => {
    it('creating user', async () => {
      const response = await agent.post('/users/registration').send(helper.validUser);
      user = response.body;
      user.should.be.an('Object');
      user.username.should.equal(helper.validUser.username);
      expect(user.password).to.be.an('undefined');
    });
    it('create other user to test against', async () => {
      const user2Info = { email: 'p@z.com', username: 'user2', password: 'passwordzzz' };
      const response = await chai.request(url).post('/users/registration').send(user2Info);
      await agent.post('/users/login').send({ email: 'p@z.com', password: 'passwordzzz' });
      user2 = response.body;
      const newAlias = validAlias;
      console.log(user, user2);
      newAlias.user = user2._id;
      const aliasResp = await agent.post(`/aliases/`).send(newAlias);
      alias2 = aliasResp.body;
      user2.should.be.an('Object');
      user2.should.be.an('Object');
      user2.username.should.equal(user2.username);
      expect(user2.password).to.be.an('undefined');
    });
  });
  describe('/users/login', () => {
    it('should login user', async () => {
      const response = await agent
        .post('/users/login')
        .send({ email: helper.validUser.email, password: helper.validUser.password });
      const responseText = response.text;
      responseText.should.equal('Welcome ');
    });
  });
  describe('/alias/ post', () => {
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
  describe('/alias/:id put', () => {
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

  describe('/aliases/:id delete', () => {
    it('should delete an alias', async () => {
      const response = await agent.delete(`/aliases/${alias._id}`);
      response.body._id.toString().should.equal(alias._id);
    });
    it('shouldnt delete a different users alias', async () => {
      console.log(`/aliases/${alias2._id}`);
      const response = await agent.delete(`/aliases/${alias2._id}`);
      response.status.should.equal(500);
    });
  });
});
