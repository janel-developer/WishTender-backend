// import Order from '../../../../server/models/Order.Model'; // doesn't work in node but shows intellisense
const Order = require('../../../../server/models/Order.Model'); // no intellisense

const chai = require('chai');
chai.use(require('chai-as-promised'));

const should = chai.should();
const helper = require('../../../helper');

describe('Order Model', () => {
  let user;
  before(async () => {
    await helper.before();
  });
  after(async () => {
    await helper.after();
    await Order.deleteMany({});
  });
  context('Create an order document', () => {
    it('should make an order', async () => {
      const wishlistItemInfo = { itemName: 'purse' };
      const order = await Order.create({
        wishlistItemInfo,
        amountToWishTender: '30',
        amountToUser: '4300',
        processorFee: '4',
        processedBy: 'Stripe',
        wishlist: '5f871bbb2e926751b17b2951',
        alias: '5f871bbb2e926751b17b2951',
        user: '5f871bbb2e926751b17b2952',
      });
      order.amountToUser.should.be.equal('4300');
    });
  });
});
