const express = require('express');

const wishRoutes = express.Router();
const WishService = require('../services/WishService');

const wishService = new WishService();

module.exports = () => {
  wishRoutes.route('/productInfo').post(async function (req, res) {
    const info = await wishService.getProductInfo(req.body.url);
    res.json(info);
  });

  return wishRoutes;
};
