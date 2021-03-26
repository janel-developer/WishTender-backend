const express = require('express');
const passport = require('passport');
const WishlistItemModel = require('../models/WishlistItem.Model');
const WishlistItemService = require('../services/WishlistItemService');
const WishlistModel = require('../models/Wishlist.Model');
const WishlistService = require('../services/WishlistService');
const logger = require('../lib/logger');
const { ApplicationError } = require('../lib/Error');
const wishlists = require('./wishlists');
const middlewares = require('./middlewares');
const ImageService = require('../services/ImageService');
const { body, check, validationResult } = require('express-validator');

const isValidPrice = (value, decimalPlaces) => {
  const correctDecimalPlaces = value.split(/([,||.])/g).reverse()[0].length === decimalPlaces;
  const commasNumbersPeriods =
    /^(0|[1-9][0-9]{0,2}(?:(,[0-9]{3})*|[0-9]*))(\.[0-9]+){0,1}$/.test(value) ||
    /^(0|[1-9][0-9]{0,2}(?:(.[0-9]{3})*|[0-9]*))(\,[0-9]+){0,1}$/.test(value);

  return correctDecimalPlaces && commasNumbersPeriods;
};

const toDotDecimal = (price) =>
  parseFloat(price.replace(/(,|\.)([0-9]{3})/g, `$2`).replace(/(,|\.)/, '.'));

const toSmallestUnit = (price, currency) => {
  const dotDec = toDotDecimal(price);
  return new Intl.NumberFormat('en', {
    style: 'currency',
    currency,
  })
    .formatToParts(dotDec)
    .reduce((a, c) => {
      if (c.type === 'integer' || c.type === 'fraction') return a + c.value;
      return a;
    }, '');
};
const currencyInfo = (currency, locale = 'en') => {
  const parts = new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: 'USD',
  }).formatToParts('1000');

  let separator;
  let decimal;
  let decimalPlaces;
  let symbol;
  parts.forEach((p) => {
    switch (p.type) {
      case 'group':
        separator = p.value;
        break;
      case 'decimal':
        decimal = p.value;
        break;
      case 'fraction':
        decimalPlaces = p.value.length;
        break;
      case 'currency':
        symbol = p.value;
        break;
      default:
      // code block
    }
  });
  const info = { separator, decimal, decimalPlaces, symbol };
  return info;
};

const profileImageDirectory = `${__dirname}/../public/data/images/itemImages`;
const imageService = new ImageService(profileImageDirectory);

const wishlistItemRoutes = express.Router();
const wishlistItemService = new WishlistItemService(WishlistItemModel);
const wishlistService = new WishlistService(WishlistModel);

async function throwIfNotAuthorizedResource(req, res, next) {
  // change this to check that wishlist is in user wishlist array
  logger.log('silly', `authorizing user owns resource...`);
  if (!req.user) {
    return next(new ApplicationError({}, `Not Authorized.`));
  }
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
      return next(new ApplicationError({}, `No wishlist item found. id: ${req.params.id}`));
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
    throwIfNotAuthorizedResource,
    middlewares.cropImage({ h: 300, w: 300 }),
    middlewares.handleImage(imageService, { h: 300, w: 300 }),
    async (req, res, next) => {
      logger.log('silly', `creating new wishlist item`);
      try {
        const imageFile = req.file && req.file.storedFilename;
        const itemInfo = { ...req.body };
        if (imageFile) itemInfo.itemImage = `/data/images/itemImages/${imageFile}`;
        delete itemInfo.imageCrop;
        const item = await wishlistItemService.addWishlistItem(itemInfo);
        return res.status(201).send(item);
      } catch (err) {
        if (req.file && req.file.storedFilename) {
          await imageService.delete(req.file.storedFilename);
        }
        logger.log('silly', `wishlist item could not be added`);
        return next(
          new ApplicationError({ err, body: req.body }, `wishlist item could not be added: ${err}`)
        );
      }
    }
  );

  wishlistItemRoutes.patch(
    '/:id',
    throwIfNotAuthorizedResource,
    middlewares.upload.single('image'),
    (req, res, next) => {
      if (!Object.keys(req.body).length) {
        return next(new ApplicationError({}, 'No data submitted.'));
      }
      return next();
    },
    [check('price', 'Price must be integer').optional().isInt()],
    (req, res, next) => {
      const errors = validationResult(req).array();
      if (errors.length) {
        return next(new ApplicationError({}, JSON.stringify(errors)));
      }
      return next();
    },
    middlewares.handleImage(imageService, { h: 300, w: 300 }),

    async (req, res, next) => {
      try {
        const imageFile = req.file && req.file.storedFilename;
        const patch = { ...req.body };
        if (imageFile) patch.itemImage = `/data/images/itemImages/${imageFile}`;
        await wishlistItemService.updateWishlistItem(req.params.id, patch);
      } catch (err) {
        if (req.file && req.file.storedFilename) {
          await imageService.delete(req.file.storedFilename);
        }
        logger.log('silly', `wishlist item could not be updated ${err}`);
        return next(
          new ApplicationError(
            { err, body: req.body },
            `wishlist item could not be updated ${req.body}: ${err}`
          )
        );
      }
      return res.sendStatus(200);
    }
  );
  // wishlistItemRoutes.post('/', throwIfNotAuthorizedResource, async (req, res, next) => {
  //   logger.log('silly', `creating wishlistItem`);

  //   let wishlistItem;
  //   const values = { ...req.body };
  //   delete values.wishlist;

  //   try {
  //     wishlistItem = await wishlistItemService.addWishlistItem(req.body.wishlist, values);
  //   } catch (err) {
  //     return next(err);
  //   }
  //   logger.log('silly', `wishlistItem created`);
  //   return res.json(wishlistItem);
  // });

  wishlistItemRoutes.put('/:id', throwIfNotAuthorizedResource, async (req, res, next) => {
    logger.log('silly', `updating wishlistItem by id`);
    const { id } = req.params;

    const updates = req.body;
    if (updates.user || updates._id)
      return next(new ApplicationError({}, `No user or id updates allowed from this route.`));
    let wishlistItem;
    try {
      wishlistItem = await wishlistItemService.updateWishlistItem(id, updates);
    } catch (err) {
      return next(err);
    }
    return res.json(wishlistItem);
  });

  wishlistItemRoutes.delete('/:id', throwIfNotAuthorizedResource, async (req, res, next) => {
    logger.log('silly', `deleting wishlist item by id`);
    const { id } = req.params;
    let wishlistItem;
    try {
      wishlistItem = await wishlistItemService.deleteWishlistItem(id);
      //need to delete image
    } catch (err) {
      return next(err);
    }
    return res.sendStatus(204);
  });

  return wishlistItemRoutes;
};
