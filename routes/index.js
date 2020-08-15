const express = require("express");
const wishRoutes = require("./wishes");
const axios = require("axios");

const userRoutes = require("./users");
const User = require("../models/User.Model");
// const wishes = require("./wishes");

// const wishersAccountsRoutes = require("./wishersAccounts");

const router = express.Router();
module.exports = (params) => {
  const { wishesService, UserModel } = params;
  router.use("/wishes", wishRoutes(wishesService));

  // router.get("/", async (req, res, next) => {
  //   console.log("routes/index.js");
  //   res.send("oops");
  // });
  // router.use("/", userRoutes(UserModel));

  return router;
};
