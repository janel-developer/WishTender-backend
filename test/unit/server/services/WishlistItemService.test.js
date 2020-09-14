/* eslint-disable no-unused-expressions */
const chai = require('chai');
chai.use(require('chai-as-promised'));
const helper = require('../../../helper');
const { help } = require('../../../../server/lib/logger');

const should = chai.should();
const { expect } = chai;

const { validWishlistItem, WishService, WishlistItemModel } = helper;

describe('The WishlistItemService', async () => {
  let wishlistId;
  before(async () => {
    helper.before();
    wishlistId = await WishlistModel.create({ name: "dashie's wishes" });
  });
  after(async () => helper.after());

  let wishId;
  context('getWishlistItems', () => {
    it('should find wishlist items for a wishlist', async () => {
      const wishlistItemService = new WishlistItemService();
      const data = await wishlistItemService.getWishlistItems(wishlistId);
      helper.logger.log('debug', data);
      expect(data).to.be.an('array');
    });
  });

  // context('addWishlistItem', () => {
  //   it('should add a wish to the specified wishlist', async () => {
  //     const wishService = new WishService();
  //     const itemName = validWishlistItem.itemName;
  //     const wishAdded = await wishService.addWishlistItem(wishlistId, validWishlistItem);
  //     // eslint-disable-next-line no-underscore-dangle
  //     if (wishAdded) wishId = wishAdded._id;
  //     const foundAddedWish = await wishService.getWish(wishId);
  //     wishId.should.exist;
  //     foundAddedWish.should.have.property('itemName').and.is.equal(itemName);
  //   });
  // });

  // context('updateWishlistItem', () => {
  //   it('should update the wishlist item', async () => {
  //     const wishlistItemUpdate = { price: '30.00' };
  //     const wishService = new WishService();
  //     const updated = await wishService.updateWishlistItem(wishId, wishlistItemUpdate);
  //     updated.should.be.an('object').and.has.property('message').and.is.not.equal('undefined');
  //     updated.price.should.be.equal('30.00');
  //   });
  // });

  // context('deleteWishlistItem', () => {
  //   it('should delete the added wishlist item', async () => {
  //     const wishService = new WishService();
  //     await wishService.deleteWish(wishId, (err, docs) => {
  //       const deleted = docs.deletedCount;
  //       deleted.should.be.an('object').and.has.property('message').and.is.not.equal('undefined');
  //     });
  //   });
  // });
});
