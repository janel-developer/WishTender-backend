const chai = require('chai');
const { help } = require('../../../../server/lib/logger');
const should = chai.should();
const Order = require('../../../../server/models/Order.Model');
const OrderService = require('../../../../server/services/OrderService');
const helper = require('../../../helper');
const orderService = new OrderService(Order);
describe('Order Service', () => {
  let user;
  let user2;
  before(async () => {
    await helper.before();
    user = await helper.createTestUser();
    const userValues = helper.validUser;
    userValues.email = 'p@fee.com';
    userValues.username = 'peeper';
    user2 = await helper.createTestUser(userValues);
  });
  after(() => {
    helper.after();
    Order.deleteMany({});
  });
  it('should create an order', async () => {
    const item = helper.validWishlistItem;
    item.user = user._id;
    const order = await orderService.createOrder(item, '4.00', '40.00', '00.40', 'Stripe', {
      name: 'Bambi',
    });
    order.wishlistItemInfo.itemName.should.be.equal(helper.validWishlistItem.itemName);
  });
  it(`should find user's orders`, async () => {
    const item2 = helper.validWishlistItem;
    item2.user = user._id;
    item2.itemName = 'blue hat';
    await orderService.createOrder(item2, '4.00', '40.00', '00.40', 'Stripe', {
      name: 'bob',
    });

    const item3 = helper.validWishlistItem;
    item3.user = user2._id;
    item3.itemName = 'brown hat';
    await orderService.createOrder(item3, '4.00', '40.00', '00.40', 'Stripe', {
      name: 'bob',
    });

    const orders = await orderService.getOrdersByUser(user._id);
    orders.length.should.be.equal(2);
  });
});
