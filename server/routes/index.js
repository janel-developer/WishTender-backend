const express = require('express');
const wishRoutes = require('./wishes');
const userRoutes = require('./users');

const router = express.Router();
module.exports = () => {
  router.use('/wishes', wishRoutes());

  router.use('/users', userRoutes());

  return router;
};
