const express = require('express');
const logger = require('../lib/logger');
const { addToCart } = require('../services/CartService');

const cartRoutes = express.Router();

module.exports = () => {
  cartRoutes.post('/add-to-cart', async (req, res, next) => {
    logger.log('silly', `adding to cart...`);
    const itemId = req.params.id;
    const currentCart = req.session.cart || null;
    const cart = await addToCart(itemId, currentCart);
    req.session.cart = cart;
    logger.log('silly', `Cart in session updated: ${req.session.cart}`);
    res.redirect('/'); // is this right?
  });
  return cartRoutes;
};
