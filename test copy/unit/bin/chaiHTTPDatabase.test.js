// just an exacmple file for how to set up chai-http with www.js
const chai = require('chai');
const chaiHttp = require('chai-http');
const www = require('../../../bin/www');

const should = chai.should();

chai.use(chaiHttp);

describe('chai HTTP test', () => {
  context('www.js with database', () => {
    it('should return hello world', async () => {
      // const res = await chai.request(www).get('/');
      // res.text.should.be.equal('Hello World!');
    });
  });
});
