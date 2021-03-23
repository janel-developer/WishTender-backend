const chai = require('chai');
const helper = require('../../../helper');
const should = chai.should();
const { expect } = chai;
const { Cart } = require('../../../../server/models/Cart.Model');
const aliases = require('../../../../server/routes/aliases');

describe('The mongoose schema', () => {
  it('should create a cart', () => {
    const cart = new Cart({});
    cart.should.be.an('Object');
    cart.add.should.be.a('Function');
  });
  context('.add()', () => {
    it('should add item', () => {
      const cart = Cart({});
      cart.add({ price: '90', _id: 'id556565', alias: '3' });
      cart.aliasCarts['3'].items.id556565.item.price.should.be.equal('90');
      cart.aliasCarts['3'].items.id556565.qty.should.be.equal(1);
      cart.aliasCarts['3'].items.id556565.price.should.be.equal(90);
    });

    it('should add multiple items', () => {
      const cart = Cart({});
      cart.add({ price: '90', _id: 'id556565', alias: '3' });
      cart.add({ price: '90', _id: 'id556565', alias: '3' });
      cart.add({ price: '90', _id: 'id5', alias: '32' });
      cart.aliasCarts['32'].items.id5.qty.should.be.equal(1);
      cart.aliasCarts['3'].items.id556565.item.price.should.be.equal('90');
      cart.aliasCarts['3'].items.id556565.qty.should.be.equal(2);
      cart.aliasCarts['3'].items.id556565.price.should.be.equal(180);
    });
  });
  context('.generateArray()', () => {
    it('should generate array', () => {
      const cart = Cart({});
      cart.add({ price: '90', _id: 'id556565', alias: '3' });
      cart.add({ price: '90', _id: 'id556565', alias: '3' });
      cart.add({ price: '90', _id: 'id5', alias: '32' });
      const array = cart.generateArray();
      array.length.should.be.equal(2);
    });
  });
  context('.reduceByOne()', () => {
    it('should reduce an items qty', () => {
      const cart = new Cart({});
      cart.add({ price: '90', _id: 'id556565', alias: '65' });
      cart.add({ price: '90', _id: 'id556565', alias: '65' });
      cart.reduceByOne('id556565', '65');
      cart.aliasCarts['65'].items.id556565.qty.should.be.equal(1);
    });
  });
  context('.removeItem()', () => {
    it('should remove item', () => {
      const cart = Cart({});
      cart.add({ price: '90', _id: 'id556565', alias: '65' });
      cart.add({ price: '90', _id: 'id556565', alias: '65' });
      cart.add({ price: '90', _id: 'id9' }, 'id9');
      cart.removeItem('id556565', '65');
      const item = cart.aliasCarts['65'].items.id556565;
      // eslint-disable-next-line no-unused-expressions
      expect(item).to.not.exist;
    });
  });
});
