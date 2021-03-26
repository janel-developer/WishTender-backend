const express = require('express');
const passport = require('passport');
const WishlistModel = require('../models/Wishlist.Model');
const WishlistService = require('../services/WishlistService');
const AliasModel = require('../models/Alias.Model');
const AliasService = require('../services/AliasService');
const logger = require('../lib/logger');
const { ApplicationError } = require('../lib/Error');
const wishlistItems = require('./wishlistItems');

const wishlistRoutes = express.Router();
const wishlistService = new WishlistService(WishlistModel);
const aliasService = new AliasService(AliasModel);

const middlewares = require('./middlewares');
const ImageService = require('../services/ImageService');

const coverImageDirectory = `${__dirname}/../public/data/images/coverImages`;
const imageService = new ImageService(coverImageDirectory);

function throwIfNotAuthorized(req, res, next) {
  logger.log('silly', `authorizing...`);
  // should authorize that req.user is owner of alias adding wishlist
  if (req.user._id != req.body.user) {
    throw new ApplicationError(
      { currentUser: req.user._id, owner: req.body.user },
      `Not Authorized. Cannot add wishlist to a different user's alias. User:${req.user._id}. Owner: ${req.body.alias} `
    );
  }

  return next();
}
async function throwIfNotAuthorizedResource(req, res, next) {
  logger.log('silly', `authorizing user owns resource...`);
  if (req.method === 'POST') {
    // should authorize that owner of alias is req.user
    if (!req.user.aliases.includes(req.body.alias)) {
      return res.send(403).send({
        message: `Not Authorized. Cannot add wishlist to alias that doesn't belong to logged in user.`,
      });
    }
  }
  if (req.method === 'PUT' || req.method === 'PATCH' || req.method === 'DELETE') {
    // should authorize that user of wishlist is req.user
    if (!req.user.wishlists.includes(req.params.id)) {
      return res.send(403).send({
        message: `Not Authorized. Wishlist doesn't belong to logged in user. `,
      });
    }
  }
  return next();
}

module.exports = () => {
  wishlistRoutes.post('/', throwIfNotAuthorizedResource, async (req, res, next) => {
    logger.log('silly', `creating wishlist`);

    let wishlist;
    const values = { ...req.body };
    delete values.alias;

    try {
      wishlist = await wishlistService.addWishlist(req.body.alias, values);
    } catch (err) {
      return next(err);
    }
    logger.log('silly', `wishlist created`);
    return res.status(201).json(wishlist);
  });

  wishlistRoutes.get('/:id', async (req, res, next) => {
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

  wishlistRoutes.put('/:id', throwIfNotAuthorizedResource, async (req, res, next) => {
    logger.log('silly', `updating wishlist by id`);
    const { id } = req.params;

    const updates = req.body;
    if (updates.user || updates._id)
      return next(new ApplicationError({}, `No user or id updates allowed from this route.`));
    let wishlist;
    try {
      wishlist = await wishlistService.updateWishlist(id, updates);
    } catch (err) {
      return next(err);
    }
    return res.json(wishlist);
  });

  wishlistRoutes.patch(
    '/:id',
    throwIfNotAuthorizedResource,
    middlewares.upload.single('image'),
    middlewares.handleImage(imageService, { h: 180, w: 600 }),
    async (req, res, next) => {
      try {
        const imageFile = req.file && req.file.storedFilename;
        const patch = { ...req.body };
        if (imageFile) patch.coverImage = `/data/images/coverImages/${imageFile}`;
        await wishlistService.updateWishlist(req.params.id, patch);
      } catch (err) {
        if (req.file && req.file.storedFilename) {
          await imageService.delete(req.file.storedFilename);
        }
        logger.log('silly', `wishlist could not be updated ${err}`);
        return next(
          new ApplicationError(
            { err, body: req.body }`wishlist could not be updated ${req.body}: ${err}`
          )
        );
      }
      return res.sendStatus(200);
    }
  );
  wishlistRoutes.delete('/:id', throwIfNotAuthorizedResource, async (req, res, next) => {
    logger.log('silly', `deleting wishlist by id`);
    const { id } = req.params;
    let wishlist;
    try {
      wishlist = await wishlistService.deleteWishlist(id);
    } catch (err) {
      return next(err);
    }
    return res.json(wishlist);
  });

  return wishlistRoutes;
};
