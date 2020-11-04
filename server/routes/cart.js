const express = require('express');
const logger = require('../lib/logger');
const { addToCart, removeItem, reduceByOne } = require('../services/CartService');

const cartRoutes = express.Router();

module.exports = () => {
  cartRoutes.post('/add-to-cart', async (req, res, next) => {
    logger.log('silly', `adding to cart...`);
    const itemId = req.body.itemId;
    const currentCart = req.session.cart || null;
    const cart = await addToCart(itemId, currentCart);
    req.session.cart = cart;
    logger.log('silly', `Cart in session updated: ${JSON.stringify(req.session.cart)}`);
    res.send('req.session.cart updated');
    // res.redirect('/'); // is this right?
  });
  cartRoutes.post('/remove-from-cart', async (req, res, next) => {
    logger.log('silly', `removing item from cart...`);
    const itemId = req.body.itemId;
    const aliasId = req.body.aliasId;
    const currentCart = req.session.cart;
    const cart = removeItem(currentCart, itemId, aliasId);
    req.session.cart = cart;
    logger.log('silly', `Cart in session updated: ${JSON.stringify(req.session.cart)}`);
    res.send('req.session.cart updated');
  });
  cartRoutes.post('/reduce', async (req, res, next) => {
    logger.log('silly', `reducing item by one from cart...`);
    const itemId = req.body.itemId;
    const aliasId = req.body.aliasId;
    const currentCart = req.session.cart;
    const cart = await reduceByOne(currentCart, itemId, aliasId);
    req.session.cart = cart;
    logger.log('silly', `Cart in session updated: ${JSON.stringify(req.session.cart)}`);
    res.send('req.session.cart updated');
  });
  return cartRoutes;
};
