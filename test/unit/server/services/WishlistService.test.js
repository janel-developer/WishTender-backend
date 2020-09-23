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
} = helper;

describe('The WishlistService', async () => {
  let wishlistId;
  let userId;
  const wishlistService = new WishlistService(WishlistModel);
  before(async () => {
    await helper.before();
    const user = await UserModel.create(validUser);
    console.log(user);
    user.aliases.push(validAlias);
    userId = user._id;
    aliasId = user.aliases[0]._id;
    await user.save();
  });
  after(async () => helper.after());

  context('addWishlist', () => {
    it('should add a wishlist to the specified user alias', async () => {
      const wishlistAdded = await wishlistService.addWishlist(userId, aliasId, validWishlist);
      wishlistId = wishlistAdded._id;
      const user = await UserModel.findById(userId);
      wishlistAdded.should.be.an('Object');
      user.aliases[0].wishlists[0]._id.toString().should.be.equal(wishlistId.toString());
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
      item = await wishlistItemService.addWishlistItem(wishlistId, helper.validWishlistItem);

      const wishlist = await wishlistService.deleteWishlist(wishlistId);
      wishlist._id.toString().should.be.equal(wishlistId.toString());
    });
    it('should remove ref from alias', async () => {
      const user = await UserModel.findById(userId);
      expect(user.aliases[0].wishlists).to.be.empty;
    });
    it('should delete wishlist items', async () => {
      item = await WishlistItemModel.findById(item._id);
      expect(item).to.be.null;
    });
  });
});
