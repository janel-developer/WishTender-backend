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

describe('user routes', () => {
  before(async () => helper.before());
  after(async () => helper.after());

  describe('/users/registration', () => {
    it('register post', async () => {
      const response = await chai.request(url).post('/users/registration').send(helper.validUser);
      const jsonResponse = response.body;
      jsonResponse.should.be.an('Object');
      jsonResponse.username.should.equal(helper.validUser.username);

      expect(jsonResponse.password).to.be.an('undefined');
    });
  });
  describe('/users/login', () => {
    it('should login a user', async () => {
      const response = await chai
        .request(url)
        .post('/users/login')
        .send({ email: helper.validUser.email, password: helper.validUser.password });
      console.log(response.headers.etag);
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
