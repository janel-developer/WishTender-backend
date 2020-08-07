const express = require("express");
const wishesRoutes = require("./wishes");
// const wishersAccountsRoutes = require("./wishersAccounts");

const router = express.Router();
module.exports = () => {
  router.use("/wishes", wishesRoutes());
  // router.use("./wishersAccounts", wishersAccountsRoutes());
  return router;
};
