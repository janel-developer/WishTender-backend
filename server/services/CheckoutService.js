const { body } = require('express-validator/check');
const ExchangeRatesApiInterface = require('../lib/ExchangeRatesApiInterface');
const OrderService = require('./OrderService');
const OrderModel = require('../models/Order.Model');
const CartService = require('./CartService');
const stripe = require('stripe')(
  process.env.NODE_END === 'production'
    ? process.env.STRIPE_SECRET_KEY
    : process.env.STRIPE_SECRET_TEST_KEY
);
const StripeService = require('../services/StripeService');
const _ = require('lodash');

const stripeService = new StripeService(stripe);

const orderService = new OrderService(OrderModel);

const ratesApi = new ExchangeRatesApiInterface();

const validate = (method) => {
  switch (method) {
    case 'checkout': {
      return [
        body('order', `order doesn't exist`).exists(),
        body('email', 'Invalid email').exists().isEmail(),
        body('phone').optional().isInt(),
        body('status').optional().isIn(['enabled', 'disabled']),
      ];
    }
  }
};

const checkout = async (aliasCart, currency, orderObject) => {
  // get exchange rate
  let usToPres = 1;
  let cart = aliasCart;
  let destToPres;
  const aliasCurrency = aliasCart.alias.currency;
  if (aliasCurrency !== currency) {
    const exchangeRates = await ratesApi.getAllExchangeRates(currency);
    usToPres = 1 / exchangeRates.USD;
    destToPres = 1 / exchangeRates[aliasCurrency];
    cart = CartService.convert(aliasCart, destToPres, currency);
  }

  // start checkout
  const { checkoutSession, fees } = await stripeService.checkoutCart(cart, currency, usToPres);

  // create order
  const newOrderObject = { ...orderObject };
  newOrderObject.processorPaymentID = checkoutSession.id;
  newOrderObject.exchangeRate = {
    wishTender: [
      { from: aliasCurrency, to: currency, value: destToPres || null, type: 'connect to customer' },
    ],
  };
  newOrderObject.processedBy = 'Stripe';
  newOrderObject.paid = false;
  newOrderObject.total = { amount: fees.charge, currency };
  newOrderObject.wishersTender = { intended: { amount: fees.wishersTender, currency } };

  // this is adding alias to every item. think about redesigning to remove alias from items
  // temp delete alias from each item
  const deleteAliasOnItems = (alCart) => {
    const aliasCartCopy = _.cloneDeep(alCart);

    const items = Object.keys(aliasCartCopy.items);
    items.forEach((item) => {
      delete aliasCartCopy.items[item].item.alias;
    });
    return aliasCartCopy;
  };

  newOrderObject.cart = deleteAliasOnItems(aliasCart);
  newOrderObject.cartConverted = !!cart.convertedTo;
  if (cart.convertedTo) newOrderObject.convertedCart = deleteAliasOnItems(cart);
  newOrderObject.fees = {
    wishTender: fees.appFee,
    stripe: {
      charge: fees.stripeFee,
      connectedAccount: fees.stripeConnectedFee,
      internationalTransfer: fees.internationalTransferFee,
      currencyConversion: fees.currencyConversionFee,
      accountDues: fees.accountFeeDue,
      total: fees.stripeTotalFee,
    },
    total: fees.appFee + fees.stripeTotalFee,
    currency,
  };

  orderService.createOrder(newOrderObject);
  return checkoutSession;
};

module.exports = { checkout };
