require('dotenv').config({ path: `${__dirname}/./../../.env` });
const stripe = require('stripe')(
  process.env.NODE_END === 'production'
    ? process.env.STRIPE_SECRET_KEY
    : process.env.STRIPE_SECRET_TEST_KEY
);
const express = require('express');
const logger = require('../lib/logger');
const StripeService = require('../services/StripeService');
const CartService = require('../services/CartService');
const CheckoutService = require('../services/CheckoutService');
const { ApplicationError } = require('../lib/Error');

const checkoutRoutes = express.Router();

const stripeService = new StripeService(stripe);
const OrderService = require('../services/OrderService');
const OrderModel = require('../models/Order.Model');
const AliasModel = require('../models/Alias.Model');

const orderService = new OrderService(OrderModel);

module.exports = () => {
  checkoutRoutes.get(
    '/success',
    async (req, res, next) => {
      const sess = await stripe.checkout.sessions.retrieve(req.query.session_id, {
        expand: ['payment_intent.charges.data'],
      });
      if (sess.payment_status !== 'paid') return res.status(401).send("This order wasn't paid for");
      req.stripeExpandedSession = sess;
      return next();
    },
    async (req, res, next) => {
      const chargeId = req.stripeExpandedSession.payment_intent.charges.data[0].id;
      const charge = await stripe.charges.retrieve(
        chargeId,
        {
          expand: [
            'balance_transaction',
            'transfer.balance_transaction',
            'transfer.destination_payment.balance_transaction',
          ],
        }
        // { stripeAccount: 'acct_1Heou2LKojKNEaYI' }
      );

      const threeBalance = [
        charge.balance_transaction,
        charge.transfer.balance_transaction,
        charge.transfer.destination_payment.balance_transaction,
      ];

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

      const { session_id, alias_id } = req.query;

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
        const time = new Date();
        time.setUTCSeconds(req.stripeExpandedSession.payment_intent.charges.data[0].created);
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
        order.save();
        let alias;
        if (order.fees.stripe.accountDues === 200) {
          alias = await AliasModel.findOne({ _id: alias_id })
            .populate({
              path: 'user',
              model: 'User',
              populate: {
                path: 'stripeAccountInfo',
                model: 'StripeAccountInfo',
              },
            })
            .exec();
          let inThirtyDays = new Date(time);
          inThirtyDays = new Date(inThirtyDays.setDate(inThirtyDays.getDate() + 30));
          alias.user.stripeAccountInfo.accountFees = {
            due: inThirtyDays,
            lastAccountFeePaid: time,
            accountFeesPaid: [...alias.user.stripeAccountInfo.accountFees.accountFeesPaid, now],
          };

          await alias.user.stripeAccountInfo.save();
        } else {
          alias = await AliasModel.findOne({ _id: alias_id })
            .populate({
              path: 'user',
              model: 'User',
            })
            .exec();
        }
        // send reciept to notify wisher
        const orderId = order._id;
        const tenderEmail = order.buyerInfo.email;

        const content = `Thank you for you for your purchase! You purchased a WishTender for ${alias.aliasName} ${alias.handle}. Total: ${order.total}. Items`;

        //send email to notify wisher
        const wishersEmail = alias.user.email;

        // needs link to manage purchases
        const content2 = `Someone purchased a gift for you! Send a thank you note to keep your fans happy.`;
      }
      if (req.session.cart && Object.keys(req.session.cart.aliasCarts).length <= 1) {
        delete req.session.cart;
      } else if (req.session.cart) {
        delete req.session.cart.aliasCarts[alias_id];
      }

      res.redirect(301, `http://localhost:3000/order?success=true&session_id=${session_id}`);
    }
  );
  checkoutRoutes.get('/canceled', async (req, res, next) => {
    const { session_id } = req.query;
    await orderService.deleteOrder({ processorPaymentID: session_id });
    res.redirect(301, `http://localhost:3000/cart`);
  });
  checkoutRoutes.post('/', async (req, res, next) => {
    logger.log('silly', `starting checkout flow...`);
    // check price updates
    const aliasId = req.body.alias;
    const aliasCart = req.session.cart.aliasCarts[aliasId];
    const result = await CartService.updateAliasCartPrices(aliasCart);
    if (result.modified) {
      req.session.cart.aliasCarts[aliasId] = result.aliasCart;

      return next(
        new ApplicationError(
          {},
          'Some prices in your cart have been updated by the wishlist owner. Please check prices before continuing'
        )
      );
    }
    const currency = req.session.user ? req.session.user.currency : null || req.cookies.currency;
    const orderObject = req.body.order;
    try {
      const checkoutSession = await CheckoutService.checkout(aliasCart, currency, orderObject);
      res.send(JSON.stringify({ checkoutSessionId: checkoutSession.id }));
    } catch (err) {
      next(err);
    }
  });

  return checkoutRoutes;
};
