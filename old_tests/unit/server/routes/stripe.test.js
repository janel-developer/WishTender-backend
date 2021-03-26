const chai = require('chai');
const chaiHttp = require('chai-http');
const should = chai.should();
const helper = require('../../../helper');

chai.use(chaiHttp);
const url = 'http://localhost:4000';
const agent = chai.request.agent(url);

describe('cart routes', () => {
  before(async () => helper.before());
  after(async () => helper.after());

  describe('/test', () => {
    // it('should add to req.session.cart', async () => {
    //   const response = await agent.post('/stripe/checkout').send({ something: '123' });
    //   response;
    // });
  });
});
