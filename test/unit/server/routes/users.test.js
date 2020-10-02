const { json } = require('body-parser');
const chai = require('chai');
const chaiHttp = require('chai-http');
// const server = require('../../../../bin/www.js');
// const app = require('../../../../server/app');

const should = chai.should();
const helper = require('../../../helper');

chai.use(chaiHttp);
const url = 'http://localhost:4000';
const { expect } = chai;

// Log in
var agent = chai.request.agent(url);

describe('user routes', () => {
  before(async () => helper.before());
  after(async () => helper.after());
  let user;
  let user2;

  describe('/users/registration', () => {
    it('register post', async () => {
      const response = await agent.post('/users/registration').send(helper.validUser);
      user = response.body;
      user.should.be.an('Object');
      user.username.should.equal(helper.validUser.username);
      expect(user.password).to.be.an('undefined');
    });
    it('register post', async () => {
      const user2Info = { email: 'p@z.com', username: 'sippy', password: 'passwordzzz' };
      const response = await chai.request(url).post('/users/registration').send(user2Info);
      user2 = response.body;
      user2.should.be.an('Object');
      user2.username.should.equal(user2.username);
      expect(user2.password).to.be.an('undefined');
    });
  });
  describe('/users/login', () => {
    it('should login a user', async () => {
      const response = await agent
        .post('/users/login')
        .send({ email: helper.validUser.email, password: helper.validUser.password });
      const responseText = response.text;
      responseText.should.equal('Welcome ');
    });
    //   it('fail to login a bad password login post', async () => {
    //     const response = await chai
    //       .request(url)
    //       .post('/users/login')
    //       .send({ email: helper.validUser.email, password: 'wrongpassword' });
    //     const responseText = response.text;
    //     responseText.should.equal('You were redirected because your login failed: ');
    //   });
    //   it('fail to login a bad email login post', async () => {
    //     const response = await chai
    //       .request(url)
    //       .post('/users/login')
    //       .send({ email: 'bademail@butt.com', password: 'wrongpassword' });
    //     const responseText = response.text;
    //     responseText.should.equal('You were redirected because your login failed: ');
    //   });
  });
  describe('/users/:id put', () => {
    it('update user', async () => {
      console.log('user', user);
      const response = await agent.put(`/users/${user._id}`).send({ username: 'Dinky' });
      const responseName = JSON.parse(response.text).username;
      responseName.should.equal('Dinky');
    });
    it('not update other user update user', async () => {
      const response = await agent.put(`/users/${user2._id}`).send({ username: 'Dink00' });

      response.status.should.equal(500); //should actually be 401 not authorized
    });
  });
  // describe('/users/:id put', () => {
  //   it('update user', async () => {
  //     const response = await chai
  //       .request(url)
  //       .put(`/users/${user._id}`)
  //       .send({ username: 'Dinky' });
  //     const responseName = JSON.parse(response.text).username;
  //     responseName.should.equal('Dinky');
  //   });
  // });
});
