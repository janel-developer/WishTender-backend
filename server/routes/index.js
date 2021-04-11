const express = require('express');
const wishRoutes = require('./wishes');
const userRoutes = require('./users');
const aliasRoutes = require('./aliases');
const wishlistRoutes = require('./wishlists');
const wishlistItemRoutes = require('./wishlistItems');
const cartRoutes = require('./cart');
const checkoutRoutes = require('./checkout');
const orderRoutes = require('./orders');
const stripeRoutes = require('./stripe');
const connectAccountRoutes = require('./connectAccount');
const confirmation = require('./confirmation');
const exchange = require('./exchange');

const router = express.Router();
module.exports = () => {
  router.use('/wishes', wishRoutes());

  router.use('/users', userRoutes());
  router.use('/aliases', aliasRoutes());
  router.use('/wishlists', wishlistRoutes());
  router.use('/wishlistItems', wishlistItemRoutes());
  router.use('/confirmation', confirmation());
  router.use('/cart', cartRoutes());
  router.use('/checkout', checkoutRoutes());
  router.use('/orders', orderRoutes());
  router.use('/stripe', stripeRoutes());
  router.use('/connectAccount', connectAccountRoutes());
  router.use('/exchange', exchange());
  return router;
};
