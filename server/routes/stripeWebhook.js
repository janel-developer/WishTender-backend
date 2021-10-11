const express = require('express');
const stripe = require('stripe')(
  process.env.NODE_ENV === 'production'
    ? process.env.STRIPE_SECRET_KEY
    : process.env.STRIPE_SECRET_TEST_KEY
);

const webhookRoutes = express.Router();
const StripeWebhookService = require('../services/StripeWebhookService');

let endpointSecret;
if (process.env.NODE_ENV === 'production') {
  endpointSecret = process.env.STRIPE_WEBHOOK_SIGNING_SECRET;
} else if (process.env.REMOTE === 'true')
  endpointSecret = process.env.STRIPE_WEBHOOK_SIGNING_SECRET_TEST_REMOTE;
else {
  endpointSecret = process.env.STRIPE_WEBHOOK_SIGNING_SECRET_TEST;
}

module.exports = () => {
  webhookRoutes.post('/', async (req, res, next) => {
    try {
      req.event = stripe.webhooks.constructEvent(
        req.body,
        req.headers['stripe-signature'],
        endpointSecret
      );
    } catch (err) {
      console.log(err);
      return res.status(400).send({ message: 'Stripe event not verified.' });
    }
    if (req.event.type === 'checkout.session.completed') {
      try {
        await StripeWebhookService.checkoutSessionCompleted(req.event.data.object);
        return res.status(200).send();
      } catch (err) {
        return next(err);
      }
    }
    return res.status(200).send();
  });
  return webhookRoutes;
};
