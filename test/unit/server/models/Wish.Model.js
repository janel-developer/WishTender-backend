const chai = require('chai');

const should = chai.should();
const Wish = require('../../../../server/models/Wish.Model');

describe('Wish Model', function () {
  context('Create a Wish', function () {
    it('should return an Object with properties _id and wish_name. wish_name should be equal to value passed in', function () {
      const wishName = 'purse';
      const wish = Wish({ wish_name: wishName });
      console.log(wish);

      //   wish.should.equal('bar');
      wish.should.have.property('_id');
      wish.should.have.property('wish_name').and.is.equal(wishName);
    });
  });
});
