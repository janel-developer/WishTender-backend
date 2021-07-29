const express = require('express');
const csrf = require('csurf');

const csrfProtection = csrf();

const passport = require('passport');
const WishlistItemModel = require('../models/WishlistItem.Model');
const WishlistItemService = require('../services/WishlistItemService');
const WishlistModel = require('../models/Wishlist.Model');
const WishlistService = require('../services/WishlistService');
const logger = require('../lib/logger');
const { ApplicationError } = require('../lib/Error');
const middlewares = require('./middlewares');
const { body, check, validationResult } = require('express-validator');
const ImageService =
  process.env.NODE_ENV === 'production' || process.env.REMOTE || process.env.AWS
    ? require('../services/AWSImageService')
    : require('../services/FSImageService');

const itemImageDirectory = `images/itemImages/`;
const imageService = new ImageService(itemImageDirectory);

const wishlistItemRoutes = express.Router();
const wishlistItemService = new WishlistItemService(WishlistItemModel);
const wishlistService = new WishlistService(WishlistModel);

function authLoggedIn(req, res, next) {
  if (!req.user) {
    return res.status(401).send();
  }
  return next();
}

async function authUserOwnsWishlistOrItem(req, res, next) {
  // change this to check that wishlist is in user wishlist array
  logger.log('silly', `authorizing user owns resource...`);
  if (req.method === 'POST') {
    // need get wish list to get user id or get alis to get wishlist id
    let wishlist;
    try {
      wishlist = await wishlistService.getWishlist(req.body.wishlist);
    } catch (err) {
      next(err);
    }

    if (wishlist.user.toString() !== req.user._id.toString()) {
      return res.status(403).send({
        message: `Cannot add wishlistItem to wishlist that doesn't belong to logged in user.`,
      });
    }
  }
  if (req.method === 'PUT' || req.method === 'PATCH' || req.method === 'DELETE') {
    let wishlistItem;
    try {
      wishlistItem = await wishlistItemService.getWishlistItem(req.params.id);
    } catch (err) {
      next(err);
    }
    if (!wishlistItem)
      return res.status(400).send({
        message: `No wishlist item with id: ${req.params.id}`,
      });
    // should authorize that user of wishlistItem is req.user
    if (wishlistItem.user.toString() !== req.user._id.toString()) {
      return res.status(403).send({
        message: `WishlistItem doesn't belong to logged in user.`,
      });
    }
  }

  return next();
}

module.exports = () => {
  wishlistItemRoutes.post(
    '/',
    (r, re, n) => {
      n();
    },
    authLoggedIn,
    csrfProtection,
    authUserOwnsWishlistOrItem,
    middlewares.onlyAllowInBodySanitizer([
      'itemName',
      'imageCrop',
      'price',
      'currency',
      'url',
      'wishlist',
    ]),
    middlewares.throwIfExpressValidatorError,
    middlewares.cropImage({ h: 300, w: 300 }),
    middlewares.handleImage(imageService, { h: 300, w: 300 }),
    async (req, res, next) => {
      logger.log('silly', `creating new wishlist item`);
      try {
        const imageFile = req.file && req.file.storedFilename;
        const itemInfo = { ...req.body };
        if (imageFile) itemInfo.itemImage = imageService.filepathToStore(imageFile);
        delete itemInfo.imageCrop;
        const item = await wishlistItemService.addWishlistItem(itemInfo);
        return res.status(201).send(item);
      } catch (err) {
        if (req.file && req.file.storedFilename) {
          await imageService.delete(req.file.storedFilename);
        }
        logger.log('silly', `wishlist item could not be added`);
        return next(
          new ApplicationError(
            { err },
            `Wishlist item could not be added because of an internal error.`
          )
        );
      }
    }
  );

  wishlistItemRoutes.patch(
    '/:id',
    authLoggedIn,
    csrfProtection,
    middlewares.onlyAllowInBodySanitizer(['itemName', 'imageCrop', 'price', 'url', 'image']),
    authUserOwnsWishlistOrItem,
    middlewares.upload.single('image'),
    (req, res, next) => {
      if (!Object.keys(req.body).length && !req.file) {
        return res.status(400).send({
          message: `No data submitted.`,
        });
      }
      return next();
    },
    [check('price', 'Price must be integer').optional().isInt()],
    middlewares.throwIfExpressValidatorError,
    middlewares.handleImage(imageService, { h: 300, w: 300 }),

    async (req, res, next) => {
      try {
        const imageFile = req.file && req.file.storedFilename;
        const patch = { ...req.body };
        if (imageFile) patch.itemImage = imageService.filepathToStore(imageFile);
        await wishlistItemService.updateWishlistItem(req.params.id, patch, imageService);
      } catch (err) {
        if (req.file && req.file.storedFilename) {
          await imageService.delete(req.file.storedFilename);
        }
        logger.log('silly', `wishlist item could not be updated ${err}`);
        return next(
          new ApplicationError(
            { err },
            `wishlist item could not be updated because of an internal error.`
          )
        );
      }
      return res.sendStatus(200);
    }
  );

  wishlistItemRoutes.delete(
    '/:id',
    authLoggedIn,
    authUserOwnsWishlistOrItem,
    async (req, res, next) => {
      logger.log('silly', `deleting wishlist item by id`);
      const { id } = req.params;
      try {
        // soft delete
        await wishlistItemService.deleteWishlistItem(id);
        // not deleting rn, just doing soft deletes
        // if (!wishlistItem.orders.length) await imageService.delete(wishlistItem.itemImage);
      } catch (err) {
        return next(err);
      }
      return res.sendStatus(204);
    }
  );

  return wishlistItemRoutes;
};
