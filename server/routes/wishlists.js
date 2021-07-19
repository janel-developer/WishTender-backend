const express = require('express');
const passport = require('passport');
const { body, param, validationResult } = require('express-validator');

const WishlistModel = require('../models/Wishlist.Model');
const WishlistService = require('../services/WishlistService');
const AliasModel = require('../models/Alias.Model');
const AliasService = require('../services/AliasService');
const logger = require('../lib/logger');
const { ApplicationError } = require('../lib/Error');
const wishlistItems = require('./wishlistItems');
const middlewares = require('./middlewares');

const wishlistRoutes = express.Router();
const wishlistService = new WishlistService(WishlistModel);
const aliasService = new AliasService(AliasModel);

const ImageService =
  process.env.NODE_ENV === 'production' || process.env.REMOTE || process.env.AWS
    ? require('../services/AWSImageService')
    : require('../services/FSImageService');

const coverImageDirectory = `images/coverImages/`;
const imageService = new ImageService(coverImageDirectory);

function authUserLoggedIn(req, res, next) {
  if (!req.user) {
    return res.status(401).send();
  }
  return next();
}

async function authUserOwnsWishlist(req, res, next) {
  logger.log('silly', `authorizing user owns resource...`);
  // ----
  // The `wishlistRoutes.post('/'` route is not necessary yet. Wishlists cannot be created on
  // their own in the first release of WishTender. Instead one default wishlist is
  // created when the account us set up.
  // -----
  // if (req.method === 'POST') {
  //   // should authorize that owner of alias is req.user
  //   if (!req.user.aliases.includes(req.body.alias)) {
  //     return res.status(403).send({
  //       message: `Not Authorized. Cannot add wishlist to alias that doesn't belong to logged in user.`,
  //     });
  //   }
  // }
  if (
    req.method === 'PUT' ||
    req.method === 'PATCH' ||
    req.method === 'DELETE' ||
    req.method === 'GET'
  ) {
    // should authorize that user of wishlist is req.user
    if (!req.user.wishlists.includes(req.params.id)) {
      logger.log('silly', "Not Authorized. Wishlist doesn't belong to logged in user.");
      return res.status(403).send({
        message: `Not Authorized. Wishlist doesn't belong to logged in user. `,
      });
    }
  }
  return next();
}

module.exports = () => {
  // ----
  // The `wishlistRoutes.post('/'` route is not necessary yet. Wishlists cannot be created on
  // their own in the first release of WishTender. Instead, one default wishlist is
  // created when the account us set up.
  // -----
  // wishlistRoutes.post('/', throwIfNotAuthorizedResource, async (req, res, next) => {
  //   logger.log('silly', `creating wishlist`);

  //   let wishlist;
  //   const values = { ...req.body };
  //   delete values.alias;

  //   try {
  //     wishlist = await wishlistService.addWishlist(req.body.alias, values);
  //   } catch (err) {
  //     return next(err);
  //   }
  //   logger.log('silly', `wishlist created`);
  //   return res.status(201).json(wishlist);
  // });

  wishlistRoutes.get('/:id', authUserLoggedIn, authUserOwnsWishlist, async (req, res, next) => {
    logger.log('silly', `getting wishlist by id`);

    const { id } = req.params;
    let wishlist;
    try {
      wishlist = await wishlistService.getWishlist(id);
    } catch (err) {
      return next(err);
    }

    return res.json(wishlist);
  });

  wishlistRoutes.patch(
    '/:id',
    authUserLoggedIn,
    authUserOwnsWishlist,

    middlewares.onlyAllowInBodySanitizer(['wishlistMessage', 'wishlistName', 'wishlistItems']),
    body('wishlistMessage', `Must not exceed 160 characters.`).isLength({ max: 160 }),
    body('wishlistName', `Must not exceed 50 characters.`).isLength({ max: 50 }),
    middlewares.throwIfExpressValidatorError,
    middlewares.upload.single('image'),
    middlewares.handleImage(imageService, { h: 180, w: 600 }),
    async (req, res, next) => {
      try {
        const imageFile = req.file && req.file.storedFilename;
        const patch = { ...req.body };
        if (imageFile) patch.coverImage = imageService.filepathToStore(imageFile);
        await wishlistService.updateWishlist(req.params.id, patch, imageService);
        console.log('wishlists.js/112');
      } catch (err) {
        if (req.file && req.file.storedFilename) {
          await imageService.delete(req.file.storedFilename);
        }
        logger.log('silly', `wishlist could not be updated ${err}`);
        return next(
          new ApplicationError(
            { err },
            `Wishlist could not be updated because of an internal error.`
          )
        );
      }
      return res.sendStatus(200);
    }
  );

  // this isn't used anywhere
  //   wishlistRoutes.delete('/:id', authUserOwnsWishlist, async (req, res, next) => {
  //     logger.log('silly', `deleting wishlist by id`);
  //     const { id } = req.params;
  //     let wishlist;
  //     try {
  //       wishlist = await wishlistService.deleteWishlist(id);
  //     } catch (err) {
  //       return next(err);
  //     }
  //     return res.json(wishlist);
  //   });

  return wishlistRoutes;
};
