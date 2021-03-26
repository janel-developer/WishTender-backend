const chai = require('chai');

const should = chai.should();
const helper = require('../../../helper');

const { logger, validWishlistItem, WishlistItemModel } = helper;

describe('WishlistListItem Model', () => {
  context('Create a basic WishlistItem', () => {
    it('should return an Object with properties _id, price, and itemName. Price and itemName should be equal to value passed in', function () {
      const wishlistItem = WishlistItemModel(validWishlistItem);
      logger.log('debug', `Wishlist Item: ${wishlistItem}`);
      wishlistItem.should.have.property('_id');
      wishlistItem.should.have.property('itemName').and.is.equal(validWishlistItem.itemName);
      wishlistItem.should.have.property('price').and.is.equal(validWishlistItem.price);
    });
  });
});
