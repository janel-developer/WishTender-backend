require('dotenv').config({ path: `${__dirname}/./../../.env` });
const stripe = require('stripe')(
  process.env.NODE_ENV === 'production'
    ? process.env.STRIPE_SECRET_KEY
    : process.env.STRIPE_SECRET_TEST_KEY
);

const mongoose = require('mongoose');

const { Schema } = mongoose;
const SessionSchema = new Schema({ session: String, _id: String }, { strict: false });
const Session = mongoose.model('sessions', SessionSchema, 'sessions');
const middlewares = require('./middlewares');

const { body, cookie } = require('express-validator');
const express = require('express');
const { ObjectId } = require('mongoose').Types;
const logger = require('../lib/logger');
const StripeService = require('../services/StripeService');
const CartService = require('../services/CartService');
const CheckoutService = require('../services/CheckoutService');
const { ApplicationError } = require('../lib/Error');
const { unitToStandard } = require('../lib/currencyFormatHelpers');
const ReceiptEmail = require('../lib/email/ReceiptEmail');
const TenderReceivedEmail = require('../lib/email/TenderReceivedEmail/TenderReceivedEmail');

const checkoutRoutes = express.Router();

const OrderService = require('../services/OrderService');
const OrderModel = require('../models/Order.Model');
const AliasModel = require('../models/Alias.Model');

const ExchangeRatesApiInterface = require('../lib/ExchangeRate-Api');

const WishlistItem = require('../models/WishlistItem.Model');

const ratesApi = new ExchangeRatesApiInterface();

const orderService = new OrderService(OrderModel);

const authOrderNotPaidFor = async (req, res, next) => {
  // eslint-disable-next-line camelcase
  const { session_id } = req.query;
  const sess = await stripe.checkout.sessions.retrieve(session_id, {
    expand: ['payment_intent.charges.data'],
  });
  if (sess.payment_status === 'paid')
    return res.status(409).send('This order was already paid for.');

  return next();
};
const authOrderPaidFor = async (req, res, next) => {
  const sess = await stripe.checkout.sessions.retrieve(req.query.session_id, {
    expand: ['payment_intent.charges.data'],
  });
  if (sess.payment_status !== 'paid') return res.status(409).send("This order wasn't paid for");
  req.stripeExpandedSession = sess;
  return next();
};

module.exports = () => {
  checkoutRoutes.get(
    // this is the route that stripe send users too after a success. I'm not sure if it is incorrect because it is a get and gets are supposed to be "safe" but this is changing the database.
    '/success',
    authOrderPaidFor,
    async (req, res, next) => {
      const chargeId = req.stripeExpandedSession.payment_intent.charges.data[0].id;
      const charge = await stripe.charges.retrieve(chargeId, {
        expand: [
          'balance_transaction',
          'transfer.balance_transaction',
          'transfer.destination_payment.balance_transaction',
        ],
      });

      const toPlatform = {
        from: { amount: charge.amount, currency: charge.currency.toUpperCase() },
        amount: charge.balance_transaction.amount,
        currency: charge.balance_transaction.currency.toUpperCase(),
        exchangeRate: charge.balance_transaction.exchange_rate,
      };
      const toConnect = {
        from: {
          amount: charge.transfer.destination_payment.amount,
          currency: charge.transfer.destination_payment.currency.toUpperCase(),
        },
        amount: charge.transfer.destination_payment.balance_transaction.amount,
        currency: charge.transfer.destination_payment.balance_transaction.currency.toUpperCase(),
        exchangeRate: charge.transfer.destination_payment.balance_transaction.exchange_rate,
      };

      // eslint-disable-next-line camelcase
      const { session_id, alias_id } = req.query;

      let alias;

      // update user account fee due
      const order = await orderService.getOrder({ processorPaymentID: session_id });
      const customerCharged = {
        from: { amountBeforeFees: order.cart.totalPrice, currency: order.cart.alias.currency },
        amountBeforeFees: order.convertedCart
          ? order.convertedCart.totalPrice
          : order.cart.totalPrice,
        amount: charge.amount,
        currency: charge.currency.toUpperCase(),
        exchangeRate: order.exchangeRate.wishTender.find((e) => e.type === 'connect to customer')
          .value,
      };
      // to prevent this request from going through twice
      if (!order.paid) {
        // add the stripe exchange rate
        order.paid = true;
        const time = new Date(
          req.stripeExpandedSession.payment_intent.charges.data[0].created * 1000
        );
        order.paidOn = time;
        order.expireAt = undefined;
        // order.wishersTender.sent = amountToWisher;
        order.cashFlow = {
          customerCharged,
          toPlatform,
          toConnect,
          connectAccount: charge.destination,
        };

        // what is this for?
        order.exchangeRate.stripe = [
          {
            from: req.stripeExpandedSession.currency.toUpperCase(),
            to: toPlatform.currency,
            value: toPlatform.exchangeRate,
            type: 'customer to platform',
          },
          {
            from: 'USD',
            to: toConnect.currency.toUpperCase(),
            value: toConnect.exchangeRate,
            type: 'platform to connect',
          },
          {
            from: toConnect.currency.toUpperCase(),
            to: req.stripeExpandedSession.currency.toUpperCase(),
            value: 1 / (toConnect.exchangeRate * toPlatform.exchangeRate),
            type: 'connect to customer',
          },
        ];
        await order.save();
        // add order number to items
        // orders.cart.items.
        let itemsUpdated = 0;

        const items = Object.keys(order.cart.items);
        await new Promise((resolve) => {
          items.forEach(async (itemId) => {
            await WishlistItem.update({ _id: itemId }, { $push: { orders: order } });
            itemsUpdated += 1;
            if (itemsUpdated === items.length) resolve();
          });
        });
        // wishlistItemService.updateWishlistItem()

        // removing because this was a crazy idea
        // if (order.fees.stripe.accountDues === 200) {
        //   alias = await AliasModel.findOne({ _id: alias_id })
        //     .populate({
        //       path: 'user',
        //       model: 'User',
        //       populate: {
        //         path: 'stripeAccountInfo',
        //         model: 'StripeAccountInfo',
        //       },
        //     })
        //     .exec();
        //   let inThirtyDays = new Date(time);
        //   inThirtyDays = new Date(inThirtyDays.setDate(inThirtyDays.getDate() + 30));
        //   alias.user.stripeAccountInfo.accountFees = {
        //     due: inThirtyDays,
        //     lastAccountFeePaid: time,
        //     accountFeesPaid: [...alias.user.stripeAccountInfo.accountFees.accountFeesPaid, time],
        //   };

        //   await alias.user.stripeAccountInfo.save();
        // } else {
        alias = await AliasModel.findOne({ _id: alias_id })
          .populate({
            path: 'user',
            model: 'User',
          })
          .exec();
        // }
        // send receipt to notify gifter
        try {
          const receiptEmail = new ReceiptEmail(order);
          const info = await receiptEmail.sendSync().then((inf) => inf);
          if (info) {
            console.log(info);
          }
        } catch (err) {
          return next(
            new ApplicationError(
              { err },
              `Couldn't send receipt to tender because of an internal error.`
            )
          );
        }

        // send notification email to notify wisher
        const wishersEmail = alias.user.email;
        try {
          const tenderReceivedEmail = new TenderReceivedEmail(order, wishersEmail);
          const info = await tenderReceivedEmail.sendSync().then((inf) => inf);
          if (info) {
            console.log(info);
          }
        } catch (err) {
          return next(
            new ApplicationError(
              { err },
              `Couldn't send notification to wisher because of an internal error.`
            )
          );
        }
      }
      const session = await Session.findOne({ _id: order.session });
      if (session) {
        const jsonSession = JSON.parse(session.session);
        if (jsonSession.cart && Object.keys(jsonSession.cart.aliasCarts).length <= 1) {
          delete jsonSession.cart;
          session.session = JSON.stringify(jsonSession);
        } else if (jsonSession.cart) {
          delete jsonSession.cart.aliasCarts[alias_id];
          session.session = JSON.stringify(jsonSession);
        }
        await session.save();
      }
      // // if the order was paid??
      // if (!alias) {
      //   alias = await AliasModel.findOne({ _id: alias_id })
      //     .populate({
      //       path: 'user',
      //       model: 'User',
      //     })
      //     .exec();
      // }
      return res.redirect(
        301,
        `${process.env.FRONT_BASEURL}/order?success=true&session_id=${session_id}&aliasHandle=${alias.handle}`
      );
    }
  );
  checkoutRoutes.get('/canceled', authOrderNotPaidFor, async (req, res, next) => {
    // eslint-disable-next-line camelcase
    const { session_id } = req.query;
    await orderService.deleteOrder({ processorPaymentID: session_id });
    return res.redirect(301, `${process.env.FRONT_BASEURL}/cart`);
  });
  checkoutRoutes.post(
    '/',
    //to do===> validate that stripe account confirmed/active do we need to?

    async (req, res, next) => {
      const aliasId = req.body.alias;
      if (!ObjectId.isValid(aliasId))
        return res.status(400).send({ message: `Alias id not valid.` });

      const alias = await AliasModel.findById(aliasId);

      if (!alias) return res.status(400).send({ message: `Alias doesn't exist` });
      return next();
    },
    cookie('currency', 'No currency set').custom(
      (currency, { req, location, path }) => (req.user && req.user.currency) || currency
    ),
    cookie(
      'currency',
      'Cookie currency must be upper case and 3 letters or you must be logged in or set to no conversion.'
    ).custom(
      (currency, { req, location, path }) =>
        currency === 'noConversion' ||
        (currency.length === 3 && currency.toUpperCase() === currency)
    ),
    body('alias', `No alias id included.`).exists(),
    body('order', `Missing order info`).exists(),
    body('order.buyerInfo.fromLine', `Must be less than 25 characters.`).isLength({ max: 35 }),
    body('order.buyerInfo.email', `Invalid email.`).isEmail(),
    async (req, res, next) => {
      // this validation was called imperatively to get access to next()
      await body('order.noteToWisher', `Note too long.`)
        .optional()
        .custom(async (note, { req, location, path }) => {
          const aliasCart = req.session.cart.aliasCarts[req.body.alias];
          const { currency } = aliasCart.alias;
          const { totalPrice } = aliasCart;
          // get US price in dollar units
          let itemToUSD;
          if (currency === 'USD') {
            itemToUSD = totalPrice;
          } else {
            let rate;
            // get conversion
            try {
              // ratesapi.io supports all the currencies of cross-borderpayouts as of 3/23/21. If this fails then we need to check if stripe or the rates api has changed
              rate = await ratesApi.getExchangeRate(currency, 'USD');
            } catch (error) {
              return next(error);
            }
            const decimalMultiplier = StripeService.decimalMultiplier(currency, 'USD');
            // we have to convert the price to the correct units, test with other units that this whole thing works
            itemToUSD = Math.round(rate * totalPrice * decimalMultiplier);
          }
          const usdDollars = unitToStandard(itemToUSD, 'USD');
          const noteLengthOK = note.length <= usdDollars + 30;
          if (!noteLengthOK)
            throw new Error(
              `Note must be less than ${usdDollars} characters. You're note is ${
                note.length - usdDollars
              } characters too long. Or add items to your gift to access more characters.`
            );
          return true;
        })
        .run(req);
      next();
    },

    middlewares.throwIfExpressValidatorError,
    async (req, res, next) => {
      // check price updates
      logger.log('silly', `checking prices are still current`);

      const aliasId = req.body.alias;

      const aliasCart = req.session.cart.aliasCarts[aliasId];
      // const result = await CartService.updateAliasCartPrices(aliasCart);
      const result = await CartService.updateAliasCart(aliasCart);
      if (result.modified.itemsModified.length) {
        req.session.cart.aliasCarts[aliasId] = result.aliasCart;
        return res.status(409).send({
          cartsModified: [result.modified],
          message:
            'Some items in your cart have been updated by the wishlist owner or are no longer available. Refresh cart to check updated items before continuing.',
        });
      }

      logger.log('silly', `starting checkout flow...`);
      let currency;
      if (req.user) {
        currency = req.user.currency;
      } else if (req.cookies.currency === 'noConversion') {
        currency = aliasCart.alias.currency;
      } else {
        currency = req.cookies.currency;
      }

      const orderObject = req.body.order;
      orderObject.noteToWisher = { message: orderObject.noteToWisher, read: null };
      orderObject.session = req.sessionID;
      orderObject.alias = req.body.alias;
      try {
        const checkoutSession = await CheckoutService.checkout(aliasCart, currency, orderObject);
        return res.status(201).send({ checkoutSessionId: checkoutSession.id });
      } catch (err) {
        next(err);
      }
    }
  );

  return checkoutRoutes;
};
