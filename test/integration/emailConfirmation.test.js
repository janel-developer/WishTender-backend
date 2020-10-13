const chai = require('chai');
const chaiHttp = require('chai-http');

const should = chai.should();
const helper = require('../helper');

chai.use(chaiHttp);
const url = 'http://localhost:4000';
const { expect } = chai;

const agent = chai.request.agent(url);

describe('user routes', () => {
  before(async () => helper.before());
  after(async () => helper.after());
  let user;

  describe('/users/registration', () => {
    // it('creating user', async () => {
    //   const response = await agent.post('/users/registration').send(helper.validUser);
    //   user = response.body;
    //   user.should.be.an('Object');
    //   user.username.should.equal(helper.validUser.username);
    //   expect(user.password).to.be.an('undefined');
    // });
  });
  // describe('/users/login', () => {
  //   it('ask user to confirm email', async () => {
  //     const response = await agent
  //       .post('/users/login')
  //       .send({ email: helper.validUser.email, password: helper.validUser.password });
  //     const responseText = response.text;
  //     responseText.should.equal('Please confirm your email');
  //   });
  // });
});
