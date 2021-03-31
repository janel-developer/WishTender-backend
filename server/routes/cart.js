const express = require('express');
const { ObjectId } = require('mongoose').Types;
const ItemModel = require('../models/WishlistItem.Model');

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
      const { itemId } = req.body;
      if (!ObjectId.isValid(itemId)) return res.status(400).send({ message: `Item id not valid.` });

      const item = await ItemModel.findById(itemId)

        .populate({
          path: 'user',
          model: 'User',
          populate: {
            path: 'stripeAccountInfo',
            model: 'StripeAccountInfo',
          },
        })
        .exec();

      if (!item) return res.status(400).send({ message: `Item doesn't exist.` });
      if (!item.user.stripeAccountInfo || !item.user.stripeAccountInfo.activated)
        return res.status(400).send({
          message: `This item is not available because the user who posted the item has not activated their account.`,
        });
      return next();
    },
    async (req, res, next) => {
      logger.log('silly', `adding to cart...`);
      const { itemId } = req.body;
      const currentCart = req.session.cart || null;
      try {
        const cart = await addToCart(itemId, currentCart);
        req.session.cart = cart;
        logger.log('silly', `Cart in session updated: ${JSON.stringify(req.session.cart)}`);
        res.status(201).json(req.session.cart);
      } catch (error) {
        if (error.info.status === 500) return next(error);
        return res.status(error.info.status).send({ message: error.message });
      }
    }
  );
  cartRoutes.patch(
    '/remove-from-cart',
    async (req, res, next) => {
      if (!req.session.cart) return res.status(400).send({ message: `No Cart.` });
      return next();
    },
    body('itemId', `No item id included.`).exists(),
    (req, res, next) => {
      const errors = validationResult(req).array();
      if (errors.length) {
        return res.status(400).send({ message: 'Form validation errors', errors });
      }
      return next();
    },
    async (req, res, next) => {
      logger.log('silly', `removing item from cart...`);
      const itemId = req.body.itemId;
      const aliasId = req.body.aliasId;
      const currentCart = req.session.cart;
      const cart = removeItem(currentCart, itemId, aliasId);
      req.session.cart = cart;
      logger.log('silly', `Cart in session updated: ${JSON.stringify(req.session.cart)}`);
      res.status(200).json(req.session.cart);
    }
  );
  cartRoutes.patch(
    '/reduce',
    (req, res, next) => {
      if (!req.session.cart) return res.status(400).send({ message: `No Cart.` });
      return next();
    },
    body('itemId', `No item id included.`).exists(),
    (req, res, next) => {
      const errors = validationResult(req).array();
      if (errors.length) {
        return res.status(400).send({ message: 'Form validation errors', errors });
      }
      return next();
    },
    async (req, res, next) => {
      logger.log('silly', `reducing item by one from cart...`);
      const itemId = req.body.itemId;
      const aliasId = req.body.aliasId;
      const currentCart = req.session.cart;
      const cart = await reduceByOne(currentCart, itemId, aliasId);
      req.session.cart = cart;
      logger.log('silly', `Cart in session updated: ${JSON.stringify(req.session.cart)}`);
      res.status(200).json(req.session.cart);
    }
  );
  cartRoutes.get('/', async (req, res, next) => {
    logger.log('silly', `Getting cart: ${JSON.stringify(req.session.cart)}`);
    res.status(200).json(req.session.cart);
  });
  return cartRoutes;
};
