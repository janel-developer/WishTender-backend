/* eslint-disable no-unused-expressions */
const chai = require('chai');
chai.use(require('chai-as-promised'));
const helper = require('../../../helper');

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

    it('should error when password too short', async () => {
      let error;
      try {
        await userService.addUser({
          username: 'dashiell',
          email: 'd@b.com',
          password: 'butt',
        });
      } catch (err) {
        error = err;
      }
      console.log(error);
      expect(error).to.be.an('Error');
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

  context('deleteUser(id)', async () => {
    let alias;
    let wishlist;
    let item;
    it('should delete the user', async () => {
      // for next tests
      const { validWishlist, validWishlistItem, validAlias } = helper;
      validAlias.user = userId;
      alias = await helper.AliasModel.create(validAlias);
      validWishlist.alias = alias._id;
      wishlist = await helper.WishlistModel.create(validWishlist);
      validWishlistItem.wishlist = wishlist._id;
      item = await helper.WishlistItemModel.create(validWishlistItem);

      // for this test
      const user = await UserModel.findById(userId);
      await user.remove();
      const deleted = await UserModel.findById(userId);
      console.log(deleted);
      expect(deleted).to.be.null;
    });
    it('should delete the child aliases', async () => {
      alias = await helper.AliasModel.findById(alias._id);
      expect(alias).to.be.null;
    });
    it(`should delete the ancestral wishlists`, async () => {
      wishlist = await helper.WishlistModel.findById(wishlist._id);
      expect(wishlist).to.be.null;
    });
    it(`should delete ancestral items`, async () => {
      item = await helper.WishlistItemModel.findById(item._id);
      expect(item).to.be.null;
    });
  });
});
