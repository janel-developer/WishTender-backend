const chai = require('chai');
const helper = require('../../../helper');
const should = chai.should();
const { expect } = chai;
const Cart = require('../../../../server/models/Cart.Model');

describe('The mongoose schema', () => {
  it('should create a cart', () => {
    const cart = new Cart({});
    cart.should.be.an('Object');
    cart.add.should.be.a('Function');
  });
  context('.add()', () => {
    it('should add item', () => {
      const cart = Cart({});
      cart.add({ price: '90', id: 'id556565' }, 'id556565');
      cart.items.id556565.item.price.should.be.equal('90');
      cart.items.id556565.qty.should.be.equal(1);
      cart.items.id556565.price.should.be.equal(90);
    });

    it('should add multiple items', () => {
      const cart = Cart({});
      cart.add({ price: '90', id: 'id556565' }, 'id556565');
      cart.add({ price: '90', id: 'id556565' }, 'id556565');
      cart.add({ price: '90', id: 'id9' }, 'id9');
      console.log(cart.items);
      cart.items.id9.qty.should.be.equal(1);
      cart.items.id556565.item.price.should.be.equal('90');
      cart.items.id556565.qty.should.be.equal(2);
      cart.items.id556565.price.should.be.equal(180);
    });
  });
  context('.generateArray()', () => {
    it('should generate array', () => {
      const cart = Cart({});
      cart.add({ price: '90', id: 'id556565' }, 'id556565');
      cart.add({ price: '90', id: 'id556565' }, 'id556565');
      cart.add({ price: '90', id: 'id9' }, 'id9');
      const array = cart.generateArray();
      array.length.should.be.equal(2);
    });
  });
  context('.reduceByOne()', () => {
    it('should reduce an items qty', () => {
      const cart = Cart({});
      cart.add({ price: '90', id: 'id556565' }, 'id556565');
      cart.add({ price: '90', id: 'id556565' }, 'id556565');
      cart.reduceByOne('id556565');
      cart.items.id556565.qty.should.be.equal(1);
    });
  });
  context('.removeItem()', () => {
    it('should reduce an items qty', () => {
      const cart = Cart({});
      cart.add({ price: '90', id: 'id556565' }, 'id556565');
      cart.add({ price: '90', id: 'id556565' }, 'id556565');
      cart.add({ price: '90', id: 'id9' }, 'id9');
      cart.removeItem('id556565');
      const item = cart.items.id556565;
      // eslint-disable-next-line no-unused-expressions
      expect(item).to.not.exist;
    });
  });
});

/**
 * Creates car object
 * @param {Sting} model name of
 *
 * @returns {Object} car object
 */
function Car(model) {
  this.model = model;

  /**
   * Makes the car drive
   * @param {String} speed speed of car
   */
  this.drive = (speed) => {
    console.log(`Car is moving at ${speed} miles per hour`);
  };
  return this;
}
const car = Car({}); // JsDocs for Car show up here
car.drive(); // Js
