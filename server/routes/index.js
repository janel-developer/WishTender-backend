const express = require('express');
const wishRoutes = require('./wishes');
const userRoutes = require('./users');
const aliasRoutes = require('./aliases');
const wishlistRoutes = require('./wishlists');
const wishlistItemRoutes = require('./wishlistItems');
const { confirmEmail } = require('../services/confirmEmail');
const cartRoutes = require('./cart');
const stripeRoutes = require('./stripe');
const sessionRoutes = require('./sessions');

const router = express.Router();
module.exports = () => {
  router.use('/wishes', wishRoutes());

  router.use('/users', userRoutes());
  router.use('/aliases', aliasRoutes());
  router.use('/wishlists', wishlistRoutes());
  router.use('/wishlistItems', wishlistItemRoutes());
  router.get('/confirmation/:email/:token', confirmEmail);
  router.use('/cart', cartRoutes());
  router.use('/stripe', stripeRoutes());
  router.use('/sessions', sessionRoutes());
  return router;
};
