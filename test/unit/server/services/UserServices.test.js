/* eslint-disable no-unused-expressions */
const chai = require('chai');
chai.use(require('chai-as-promised'));
const helper = require('../../../helper');

const should = chai.should();
const { expect } = chai;

const { validUser, UserService } = helper;

describe('The UserService', async () => {
  beforeEach(async () => helper.before());
  afterEach(async () => helper.after());
  let wishId;
  context('getData()', () => {
    it('should find Users', async () => {
      const User = new UserService();
      const data = await UserService.getData();
      expect(data).to.be.an('array');
    });
  });

  context('addUser(id)', () => {
    it('should add a wish', async () => {
      const wishService = new WishService();
      const wishName = validWish.wish_name;
      const wishAdded = await wishService.addWish(validWish);
      // eslint-disable-next-line no-underscore-dangle
      if (wishAdded) wishId = wishAdded._id;
      const foundAddedWish = await wishService.getWish(wishId);
      wishId.should.exist;
      foundAddedWish.should.have.property('wish_name').and.is.equal(wishName);
    });
  });

  context('deleteWish(id, callback)', () => {
    it('should delete the added wish', async () => {
      const wishService = new WishService();
      await wishService.deleteWish(wishId, (err, docs) => {
        const deleted = docs.deletedCount;
        deleted.should.be.a('number').and.is.equal(1);
      });
    });
  });
});
