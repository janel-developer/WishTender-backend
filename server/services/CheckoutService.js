require('express-validator');
const _ = require('lodash');
const stripe = require('stripe')(
  process.env.NODE_ENV === 'production'
    ? process.env.STRIPE_SECRET_KEY
    : process.env.STRIPE_SECRET_TEST_KEY
);
const ExchangeRatesApiInterface = require('../lib/ExchangeRate-Api');
const OrderService = require('./OrderService');
const OrderModel = require('../models/Order.Model');
const CartService = require('./CartService');
const StripeService = require('../services/StripeService');

const stripeService = new StripeService(stripe);

const orderService = new OrderService(OrderModel);

const ratesApi = new ExchangeRatesApiInterface();

const checkout = async (aliasCart, currency, orderObject) => {
  // get exchange rate
  let usToPres = 1;
  let cart = aliasCart;
  let destToPres;
  let decimalMultiplierUsToPres = 1;
  const aliasCurrency = aliasCart.alias.currency;
  if (aliasCurrency !== currency) {
    // check if api supports conversion between these curencies - is this necessary?
    let exchangeRates;
    try {
      exchangeRates = await ratesApi.getAllExchangeRates(currency);
    } catch (error) {
      throw new Error(`${currency} not supported`);
    }
    usToPres = 1 / exchangeRates.USD;
    destToPres = 1 / exchangeRates[aliasCurrency];
    // if (isNaN(destToPres)) throw new Error(`${aliasCurrency} not supported for `);

    decimalMultiplierUsToPres = StripeService.decimalMultiplier('USD', currency);
    const decimalMultiplierSettleToPres = StripeService.decimalMultiplier(aliasCurrency, currency);
    cart = CartService.convert(aliasCart, destToPres, currency, decimalMultiplierSettleToPres);
  }

  // start checkout
  const checkoutSession = await stripeService.checkoutCart(
    cart,
    currency,
    usToPres,
    decimalMultiplierUsToPres
  );

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
  newOrderObject.expireAt = new Date().toISOString();
  newOrderObject.wishersTender = { intended: { amount: aliasCart.totalPrice, aliasCurrency } };
  newOrderObject.total = {
    amount: checkoutSession.amount_total,
    currency,
  }; // cart is converted alias cart is not converted here
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
    wishTender: aliasCart.totalPrice * 0.1,
    // stripe: {
    //   charge: fees.stripeFee,
    //   connectedAccount: fees.stripeConnectedFee,
    //   internationalTransfer: fees.internationalTransferFee,
    //   currencyConversion: fees.currencyConversionFee,
    //   accountDues: fees.accountFeeDue,
    //   total: fees.stripeTotalFee,
    // },
    total: Math.round(aliasCart.totalPrice * 1.1),
    currency,
  };
  /// what if no converted cart?
  // if (newOrderObject.convertedCart) {
  //   newOrderObject.total = {
  //     amount: Math.round(newOrderObject.convertedCart.totalPrice * 1.1),
  //     currency,
  //   };
  // } else {
  //   newOrderObject.total = {
  //     amount: Math.round(newOrderObject.Cart.totalPrice * 1.1),
  //     aliasCurrency,
  //   };
  // }

  await orderService.createOrder(newOrderObject);
  return checkoutSession;
};

module.exports = { checkout };
