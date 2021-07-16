const express = require('express');

const wishRoutes = express.Router();
const WishService = require('../services/WishService');

const wishService = new WishService();

module.exports = () => {
  wishRoutes.route('/productInfo').get(async function (req, res) {
    try {
      const info = await wishService.getProductInfo(req.query.url);

      res.status(200).json(info);
    } catch (err) {
      if (err.constructor.name === 'ApplicationError') {
        throw err;
      }

      res.status(403).json({ message: err.message });
    }
  });

  return wishRoutes;
};
