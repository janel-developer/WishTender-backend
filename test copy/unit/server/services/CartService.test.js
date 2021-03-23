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
      const cart = await CartService.addToCart(testUser.wishlistItems[0]._id, null);
      cart.aliasCarts[testUser.alias._id].totalPrice.should.equal(46);
    });
    it('should add to existing cart', async () => {
      let cart = await CartService.addToCart(testUser.wishlistItems[0]._id, null);
      cart = await CartService.addToCart(testUser.wishlistItems[0]._id, cart);
      cart.aliasCarts[testUser.alias._id].totalQty.should.equal(2);
    });
  });
  // context('checkout', () => {
  //   it('checkout', async () => {
  //     let cart = await CartService.addToCart(testUser.wishlistItems[0]._id, null);
  //     cart = await CartService.addToCart(testUser.wishlistItems[0]._id, cart);
  //     cart = await CartService.addToCart(testUser.wishlistItems[1]._id, cart);
  //     console.log(cart);
  //   });
  // });
});
