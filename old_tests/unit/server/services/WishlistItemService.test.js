/* eslint-disable no-unused-expressions */
const chai = require('chai');
chai.use(require('chai-as-promised'));
const helper = require('../../../helper');

const should = chai.should();
const { expect, assert } = chai;

const { validWishlistItem, WishlistItemService, WishlistModel, WishlistItemModel } = helper;

describe('The WishlistItemService', async () => {
  let wishlistId;
  let userId;
  let aliasId;
  const wishlistItemIds = [];
  const wishlistItemService = new WishlistItemService(WishlistItemModel);
  before(async () => {
    await helper.before();
    let user = await helper.UserModel.create(helper.validUser);
    userId = user._id;
    const aliasObject = helper.validAlias;
    aliasObject.user = userId;
    let alias = await helper.AliasModel.create(aliasObject);
    aliasId = alias._id;
    let wishlist = await WishlistModel.create({
      wishlistName: "dashie's wishes",
      alias: aliasId,
      user: userId,
    });
    wishlistId = wishlist._id;
  });
  after(async () => helper.after());

  context('addWishlistItem', () => {
    it('should add a wishlist item to the specified wishlist', async () => {
      const { itemName } = validWishlistItem;
      const valuesWishlistItem = validWishlistItem;
      valuesWishlistItem.user = userId;
      const wishAdded = await wishlistItemService.addWishlistItem(wishlistId, validWishlistItem);
      // helper.logger.log('debug', `Wish added ${wishAdded}`);
      wishlistItemIds.push(wishAdded._id);
      wishAdded.should.have.property('itemName').and.is.equal(itemName);
      wishAdded.should.have
        .property('wishlist')
        .and.is.not.equal('undefined')
        .and.is.not.equal('null');
    });

    it('should throw an error with a bad wishlist item', async () => {
      let error;
      try {
        await wishlistItemService.addWishlistItem(wishlistId, {});
      } catch (err) {
        error = err;
      }
      error.should.be.an('Error');
    });
    it('should throw an error with a bad wishlist id', async () => {
      let error;
      try {
        await wishlistItemService.addWishlistItem('1234567898765', validWishlistItem);
      } catch (err) {
        error = err;
      }
      error.should.be.an('Error');
    });
  });
  context('getWishlistItems', () => {
    it('should find wishlist items', async () => {
      const data = await wishlistItemService.getWishlistItems(wishlistItemIds);
      helper.logger.log('debug', `wishes ${data}`);
      expect(data).to.be.an('array');
    });
    it('should throw an error when cast fails', async () => {
      let error;
      try {
        await wishlistItemService.getWishlistItems(['5f65770d610bb57378666ca']);
      } catch (err) {
        error = err;
      }
      expect(error).to.be.an('Error');
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
        `
      updatedItem: ${updated}`
      );
      updated.should.be.an('Object');
      updated.price.should.equal('30.00');
    });
    it(' should error on wrong id', async () => {
      console.log(wishlistItemIds[0]);
      const wishlistItemUpdate = { price: '30.00' };
      let error;
      try {
        await wishlistItemService.updateWishlistItem(
          '5f661bf8b1cd293353fb6639',
          wishlistItemUpdate
        );
      } catch (err) {
        error = err;
      }

      expect(error).to.be.an('Error');
    });
  });

  context('deleteWishlistItem', () => {
    it('should delete the added wishlist item.', async () => {
      const deletedItem = await wishlistItemService.deleteWishlistItem(wishlistItemIds[0]);
      helper.logger.log(
        'debug',
        `
      deletedItem: "${deletedItem}"`
      );
      const id = deletedItem._id.toString();
      deletedItem.should.be.an('Object');
      id.should.be.equal(wishlistItemIds[0].toString());
    });
    it('should delete the ref id in wishlist.', async () => {
      const wishlist = await WishlistModel.findById(wishlistId);
      assert.notInclude(wishlist.wishlistItems, wishlistItemIds[0], "array doesn't contain value");
    });
    it(`handle a delete wishlist item that's not found.`, async () => {
      let error;
      try {
        const deletedItem = await wishlistItemService.deleteWishlistItem(
          '5f6678c89cc20b7cc6d82ef5'
        );
      } catch (err) {
        error = err;
      }
      error.should.be.an('Error');
    });
  });
});
