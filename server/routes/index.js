const express = require('express');
const wishRoutes = require('./wishes');
const userRoutes = require('./users');
const aliasRoutes = require('./aliases');
const wishlistRoutes = require('./wishlists');
const wishlistItemRoutes = require('./wishlistItems');
const { confirmEmail } = require('../services/confirmEmail');
const cartRoutes = require('./cart');
const checkoutRoutes = require('./checkout');
const orderRoutes = require('./orders');

const router = express.Router();
module.exports = () => {
  router.use('/wishes', wishRoutes());

  router.use('/users', userRoutes());
  router.use('/aliases', aliasRoutes());
  router.use('/wishlists', wishlistRoutes());
  router.use('/wishlistItems', wishlistItemRoutes());
  router.get('/confirmation/:email/:token', confirmEmail);
  router.use('/cart', cartRoutes());
  router.use('/checkout', checkoutRoutes());
  router.use('/orders', orderRoutes());
  return router;
};
