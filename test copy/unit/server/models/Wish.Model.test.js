const chai = require('chai');

const should = chai.should();
const helper = require('../../../helper');

const { validWish, WishModel } = helper;

describe('Wish Model', () => {
  context('Create a Wish', () => {
    it('should return an Object with properties _id and wish_name. wish_name should be equal to value passed in', function () {
      const wishName = validWish.wish_name;
      const wish = WishModel(validWish);

      wish.should.have.property('_id');
      wish.should.have.property('wish_name').and.is.equal(wishName);
    });
  });
});
