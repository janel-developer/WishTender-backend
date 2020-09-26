const chai = require('chai');

const should = chai.should();
const helper = require('../../../helper');

const { expect } = chai;
const { logger, validWishlist, WishlistModel } = helper;

describe('WishlistListItem Model', () => {
  context('Create a basic Wishlist', () => {
    it(`should return an Object with properties _id, wishlists, and wishlistName.
    wishlistName should be equal to value passed in. 
    wishlistItems should be an array`, function () {
      const wishlist = WishlistModel(validWishlist);
      logger.log('debug', `Wishlist: ${wishlist}`);
      wishlist.should.have.property('_id');
      wishlist.should.have.property('wishlistItems').and.is.an('Array');
      wishlist.should.have.property('wishlistName').and.is.equal(validWishlist.wishlistName);
    });
    it('should not work if alias not exist', async () => {
      const invalidWishlist = validWishlist;
      invalidWishlist.alias = '5f6e6353b171015f763464a';
      let error;
      try {
        wishlist = await WishlistModel.create(invalidWishlist);
      } catch (err) {
        error = err;
        console.log(err.message);
      }
      expect(error).to.be.an('Error');
    });
  });
});
