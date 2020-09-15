/* eslint-disable no-unused-expressions */
const chai = require('chai');
chai.use(require('chai-as-promised'));
const helper = require('../../../helper');

const should = chai.should();
const { expect, assert } = chai;

const { validWishlistItem, WishlistItemService, WishlistModel, WishlistItemModel } = helper;

describe('The WishlistItemService', async () => {
  let wishlistId;
  const wishlistItemIds = [];
  let wishId;
  const wishlistItemService = new WishlistItemService(WishlistItemModel);
  before(async () => {
    await helper.before();
    let wishlist = await WishlistModel.create({ wishlistName: "dashie's wishes" });
    wishlistId = wishlist._id;
  });
  after(async () => helper.after());

  context('addWishlistItem', () => {
    it('should add a wishlist item to the specified wishlist', async () => {
      const { itemName } = validWishlistItem;
      const wishAdded = await wishlistItemService.addWishlistItem(wishlistId, validWishlistItem);
      helper.logger.log('debug', `Wish added ${wishAdded}`);
      wishlistItemIds.push(wishAdded._id);
      wishAdded.should.have.property('itemName').and.is.equal(itemName);
      wishAdded.should.have
        .property('wishlist')
        .and.is.not.equal('undefined')
        .and.is.not.equal('null');
    });
  });
  context('getWishlistItems', () => {
    it('should find wishlist items', async () => {
      const data = await wishlistItemService.getWishlistItems(wishlistItemIds);
      console.log(wishlistItemIds);
      helper.logger.log('debug', `wishes ${data}`);
      expect(data).to.be.an('array');
    });
  });

  context('updateWishlistItem', () => {
    it('should update the wishlist item', async () => {
      const wishlistItemUpdate = { price: '30.00' };
      const updated = await wishlistItemService.updateWishlistItem(
        wishlistItemIds[0],
        wishlistItemUpdate
      );
      helper.logger.log(
        'debug',
        `return object message: ${updated.message}, success: ${updated.success}, \n updatedItem: ${updated.updatedItem}`
      );

      updated.should.be.an('object').and.has.property('message').and.is.not.equal('undefined');
      updated.should.be.an('object').and.has.property('success').and.is.equal(true);
      updated.updatedItem.price.should.be.equal('30.00');
    });
  });

  context('deleteWishlistItem', () => {
    it('should delete the added wishlist item.', async () => {
      const successMessage = await wishlistItemService.deleteWishlistItem(wishlistItemIds[0]);
      helper.logger.log(
        'debug',
        `\nreturn object message: "${successMessage.message}", \nsuccess: ${successMessage.success}, \ndeletedItem: ${successMessage.deletedItem}`
      );
      successMessage.should.be
        .an('object')
        .and.has.property('message')
        .and.is.not.equal('undefined');
      successMessage.should.be.an('object').and.has.property('success').and.is.equal(true);
    });
    it('should delete the ref id in wishlist.', async () => {
      const wishlist = await WishlistModel.findById(wishlistId);
      assert.notInclude(wishlist.wishlistItems, wishlistItemIds[0], "array doesn't contain value");
    });
  });
});
