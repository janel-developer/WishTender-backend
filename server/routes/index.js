const express = require('express');
const wishRoutes = require('./wishes');
const userRoutes = require('./users');

const router = express.Router();
module.exports = () => {
  router.use('/wishes', wishRoutes());

  router.use('/users', userRoutes());
  // router.post('/', (req, res) => { //git hub help
  //   console.log(req.body);
  //   Object.assign(req.body, { authToken: 'token' });
  //   console.log(req.body);
  // });
  return router;
};
