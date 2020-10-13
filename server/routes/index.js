const express = require('express');
const wishRoutes = require('./wishes');
const userRoutes = require('./users');
const aliasRoutes = require('./aliases');
const wishlistRoutes = require('./wishlists');
const wishlistItemRoutes = require('./wishlistItems');
const { confirmEmail } = require('../services/confirmEmail');
// console.log(confirmEmail);

const router = express.Router();
module.exports = () => {
  router.use('/wishes', wishRoutes());

  router.use('/users', userRoutes());
  router.use('/aliases', aliasRoutes());
  router.use('/wishlists', wishlistRoutes());
  router.use('/wishlistItems', wishlistItemRoutes());
  router.get('/confirmation/:email/:token', confirmEmail);
  // router.post('/', (req, res) => { //git hub help
  //   console.log(req.body);
  //   Object.assign(req.body, { authToken: 'token' });
  //   console.log(req.body);
  // });
  return router;
};
