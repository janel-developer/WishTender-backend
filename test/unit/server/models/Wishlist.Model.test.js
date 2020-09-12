const chai = require('chai');

const should = chai.should();
const helper = require('../../../helper');

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
  });
});
