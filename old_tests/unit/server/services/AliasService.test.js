/* eslint-disable no-unused-expressions */
const chai = require('chai');
chai.use(require('chai-as-promised'));
const helper = require('../../../helper');

const should = chai.should();
const { expect } = chai;

const {
  WishlistItemModel,
  validWishlist,
  validUser,
  validAlias,
  UserModel,
  WishlistService,
  WishlistModel,
  AliasModel,
  AliasService,
} = helper;

describe('The AliasService', async () => {
  let aliasId;
  let userId;
  const aliasService = new AliasService(AliasModel);
  before(async () => {
    await helper.before();
    const user = await UserModel.create(validUser);
    userId = user._id;
  });
  after(async () => helper.after());

  context('addAlias', () => {
    it('should add an alias to the specified user', async () => {
      const aliasAdded = await aliasService.addAlias(userId, validAlias);
      aliasId = aliasAdded._id;
      const user = await UserModel.findById(userId);
      const id = user.aliases[0]._id.toString();

      aliasAdded.should.be.an('Object');
      id.should.be.equal(aliasId.toString());
    });
  });
  context('getAlias', () => {
    it('should get an alias', async () => {
      const alias = await aliasService.getAlias(aliasId);
      alias._id.toString().should.be.equal(aliasId.toString());
    });
  });
  context('updateAlias', () => {
    it('should update an alias', async () => {
      const alias = await aliasService.updateAlias(aliasId, {
        aliasName: 'Jan',
      });
      alias.aliasName.should.be.equal('Jan');
    });
  });
  context('deleteAlias', () => {
    let wishlist;
    it('should delete an alias', async () => {
      // for deleting children test
      const wishlistService = new WishlistService(WishlistModel);
      const wishlistValues = validWishlist;
      wishlistValues.user = userId;
      wishlist = await wishlistService.addWishlist(aliasId, validWishlist);

      const alias = await aliasService.deleteAlias(aliasId);
      alias.should.be.an('Object');
    });
    it('should remove ref from user', async () => {
      // this is really a test for the Alias model not service
      user = await UserModel.findById(userId);
      console.log(aliasId, user);
      expect(user.aliases).to.be.empty;
    });
    it('should delete wishlists', async () => {
      wishlist = await WishlistItemModel.findById(wishlist._id);
      expect(wishlist).to.be.null;
    });
  });
});
