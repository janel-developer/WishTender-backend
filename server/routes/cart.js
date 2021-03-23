const express = require('express');
const logger = require('../lib/logger');
const { addToCart, removeItem, reduceByOne } = require('../services/CartService');

const cartRoutes = express.Router();
const { body, validationResult } = require('express-validator');

module.exports = () => {
  cartRoutes.patch(
    '/add-to-cart',
    body('itemId', `No item id included.`).exists(),
    (req, res, next) => {
      const errors = validationResult(req).array();
      if (errors.length) {
        return res.status(400).send({ message: 'Form validation errors', errors });
      }
      return next();
    },
    async (req, res, next) => {
      logger.log('silly', `adding to cart...`);
      const { itemId } = req.body;
      const currentCart = req.session.cart || null;
      try {
        const cart = await addToCart(itemId, currentCart);
      } catch (error) {
        if (error.info.status === 500) return next(error);
        return res.status(error.info.status).send({ message: error.message });
      }
      req.session.cart = cart;
      logger.log('silly', `Cart in session updated: ${JSON.stringify(req.session.cart)}`);
      res.status(201).send(req.session.cart);
    }
  );
  cartRoutes.patch('/remove-from-cart', async (req, res, next) => {
    logger.log('silly', `removing item from cart...`);
    const itemId = req.body.itemId;
    const aliasId = req.body.aliasId;
    const currentCart = req.session.cart;
    const cart = removeItem(currentCart, itemId, aliasId);
    req.session.cart = cart;
    logger.log('silly', `Cart in session updated: ${JSON.stringify(req.session.cart)}`);
    res.send('req.session.cart updated');
  });
  cartRoutes.patch('/reduce', async (req, res, next) => {
    logger.log('silly', `reducing item by one from cart...`);
    const itemId = req.body.itemId;
    const aliasId = req.body.aliasId;
    const currentCart = req.session.cart;
    const cart = await reduceByOne(currentCart, itemId, aliasId);
    req.session.cart = cart;
    logger.log('silly', `Cart in session updated: ${JSON.stringify(req.session.cart)}`);
    res.send('req.session.cart updated');
  });
  cartRoutes.get('/', async (req, res, next) => {
    logger.log('silly', `Getting cart: ${JSON.stringify(req.session.cart)}`);
    res.send(req.session.cart);
  });
  return cartRoutes;
};
