/* eslint-disable no-unused-expressions */
const chai = require('chai');
chai.use(require('chai-as-promised'));
const helper = require('../../../helper');
const { deleteMany } = require('../../../../server/models/User.Model');

const should = chai.should();
const { expect } = chai;

const {
  validUser,
  WishlistModel,
  UserService,
  WishlistService,
  WishlistItemService,
  WishlistItemModel,
  UserModel,
} = helper;

describe('The UserService', async () => {
  let userId;
  let aliasId;
  const userService = new UserService(UserModel);
  before(async () => helper.before());
  after(async () => helper.after());

  context('addUser(user)', () => {
    it('should add a user', async () => {
      const addedUser = await userService.addUser(validUser);
      userId = addedUser._id;
      addedUser.should.be.an('Object');
      addedUser.username.should.be.equal(validUser.username);
    });
  });

  context('getUser(id)', () => {
    it('should find a user', async () => {
      const foundUser = await userService.getUser(userId);
      expect(foundUser).to.be.an('Object');
    });
  });

  context('updateUser(id)', () => {
    it('should update a user', async () => {
      const updatedUser = await userService.updateUser(userId, { username: 'frankandbeans' });
      updatedUser.username.should.be.equal('frankandbeans');
    });
  });

  context('addAlias(userId, alias)', () => {
    it('should an alias to a user', async () => {
      const alias = await userService.addAlias(userId, { aliasName: 'Dash', handle: 'ftftftftf' });
      aliasId = alias._id;
    });
  });
  context('deleteUser(id)', async () => {
    let wishlist;
    let item;
    it('should delete the user', async () => {
      // for the next nest
      const wishlistService = new WishlistService(WishlistModel);
      const wishlistItemService = new WishlistItemService(WishlistItemModel);
      wishlist = await wishlistService.addWishlist(userId, aliasId, {
        wishlistName: 'fun list',
      });
      item = await wishlistItemService.addWishlistItem(wishlist._id, {
        price: '90.00',
        itemName: 'purse',
      });

      // for this test
      const deletedUser = await userService.deleteUser(userId);

      deletedUser.should.be.an('Object');
    });
    it('should delete the children wishlists and wishlist items', async () => {
      wishlist = await WishlistItemModel.findById(wishlist.id);
      item = await WishlistItemModel.findById(item._id);
      expect(wishlist).to.be.null;
      expect(item).to.be.null;
    });
  });
});
