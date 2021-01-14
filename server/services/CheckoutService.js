const { body } = require('express-validator/check');
const ExchangeRatesApiInterface = require('../lib/ExchangeRatesApiInterface');
const OrderService = require('./OrderService');
const OrderModel = require('../models/Order.Model');

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

// {
//     alias: data.aliasId,
//     order: {
//       buyerInfo: {
//         email: data.email,
//         fromLine: data.fromLine,
//       },
//       alias: data.aliasId,
//       noteToWisher: data.note,
//       processedBy: "Stripe",
//       processed: false,
//     },
//   },

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
    cart = CartService.convert(aliasCart, destToPres);
  }

  // start checkout
  const checkoutSession = await stripeService.checkoutCart(cart, currency, usToPres);

  // create order
  const newOrderObject = { ...orderObject };
  newOrderObject.processorPaymentID = checkoutSession.id;
  newOrderObject.exchangeRate = {
    wishTender: destToPres || null,
  };
  newOrderObject.processedBy = 'Stripe';
  newOrderObject.processed = false;
  orderService.createOrder(newOrderObject);
  return checkoutSession;
};

module.exports = { checkout };
