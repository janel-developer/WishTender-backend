const express = require("express");
const wishesRoutes = require("./wishes");
// const wishersAccountsRoutes = require("./wishersAccounts");

const router = express.Router();
module.exports = (params) => {
  router.use("/wishes", wishesRoutes(params));
  // router.use("./wishersAccounts", wishersAccountsRoutes());
  return router;
};
