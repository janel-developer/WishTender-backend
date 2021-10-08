const express = require('express');

const wishRoutes = express.Router();
const WishService = require('../services/WishService');

const wishService = new WishService();

module.exports = () => {
  wishRoutes.route('/productInfo').get(async function (req, res, next) {
    try {
      const info = await wishService.getProductInfo(req.query.url);

      res.status(200).json(info);
    } catch (err) {
      if (err.constructor.name === 'ApplicationError') {
        return next(err);
      }

      return res.status(403).json({ message: err.message });
    }
  });

  wishRoutes.route('/amazon').get(async function (req, res, next) {
    try {
      const info = await wishService.getAmazonInfo(req.query.url);

      res.status(200).json(info);
    } catch (err) {
      if (err.constructor.name === 'ApplicationError') {
        return next(err);
      }

      return res.status(403).json({ message: err.message });
    }
  });
  wishRoutes.route('/scroll').get(async function (req, res, next) {
    try {
      const info = await wishService.scroll(req.query.url);

      res.status(200).json(info);
    } catch (err) {
      if (err.constructor.name === 'ApplicationError') {
        return next(err);
      }

      return res.status(403).json({ message: err.message });
    }
  });

  wishRoutes.route('/scrapeHtml').post(async function (req, res) {
    try {
      const info = await wishService.scrapeHTML(req.body.html);
      // console.log(JSON.stringify(info));
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
