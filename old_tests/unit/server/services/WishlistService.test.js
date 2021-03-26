/* eslint-disable no-unused-expressions */
const chai = require('chai');
chai.use(require('chai-as-promised'));
const helper = require('../../../helper');

const should = chai.should();
const { expect } = chai;

const {
  WishlistItemModel,
  WishlistItemService,
  validWishlist,
  validUser,
  validAlias,
  UserModel,
  WishlistService,
  WishlistModel,
  AliasModel,
} = helper;

describe('The WishlistService', async () => {
  let wishlistId;
  let alias;
  let aliasId;
  let user;
  const wishlistService = new WishlistService(WishlistModel);
  before(async () => {
    await helper.before();

    user = await UserModel.create(validUser);
    validAlias.user = user._id;
    alias = await AliasModel.create(validAlias);
    aliasId = alias._id;
  });
  after(async () => helper.after());

  context('addWishlist', () => {
    it('should add a wishlist to the specified alias', async () => {
      const values = validWishlist;
      values.user = user._id;
      const wishlistAdded = await wishlistService.addWishlist(aliasId, validWishlist);
      wishlistId = wishlistAdded._id;
      alias = await AliasModel.findById(aliasId);
      console.log('alias', alias);
      const id = alias.wishlists[0]._id.toString();

      wishlistAdded.should.be.an('Object');
      id.should.be.equal(wishlistId.toString());
    });
  });
  context('getWishlist', () => {
    it('should get a wishlist', async () => {
      const wishlist = await wishlistService.getWishlist(wishlistId);
      wishlist._id.toString().should.be.equal(wishlistId.toString());
    });
  });
  context('updateWishlist', () => {
    it('should update a wishlist', async () => {
      const wishlist = await wishlistService.updateWishlist(wishlistId, {
        wishlistName: 'Birthday',
      });
      wishlist.wishlistName.should.be.equal('Birthday');
    });
  });
  context('deleteWishlist', () => {
    let item;
    it('should delete a wishlist', async () => {
      // for deleting children items test
      const wishlistItemService = new WishlistItemService(WishlistItemModel);
      const valuesItem = helper.validWishlistItem;
      valuesItem.user = user._id;
      item = await wishlistItemService.addWishlistItem(wishlistId, valuesItem);

      const wishlist = await wishlistService.deleteWishlist(wishlistId);
      wishlist._id.toString().should.be.equal(wishlistId.toString());
    });
    it('should remove ref from alias', async () => {
      alias = await AliasModel.findById(aliasId);
      expect(alias.wishlists).to.be.empty;
    });
    it('should delete wishlist items', async () => {
      item = await WishlistItemModel.findById(item._id);
      expect(item).to.be.null;
    });
  });
});
