const CartService = require('../../../../server/services/CartService');
const chai = require('chai');
const helper = require('../../../helper');
const should = chai.should();

describe('Cart Service', () => {
  let testUser;
  before(async () => {
    await helper.before();
    testUser = await helper.createTestUserFull();
  });
  after(async () => helper.after());
  context('addToCart', () => {
    it('should add to cart', async () => {
      const cart = await CartService.addToCart(testUser.wishlistItem._id, null);
      cart.totalPrice.should.equal(46);
    });
    it('should add to existing cart', async () => {
      let cart = await CartService.addToCart(testUser.wishlistItem._id, null);
      cart = await CartService.addToCart(testUser.wishlistItem._id, cart);
      cart.totalQty.should.equal(2);
    });
  });
});
