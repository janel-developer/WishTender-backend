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
    let alias;
    try {
      alias = await aliasService.getAlias(req.body.alias);
    } catch (err) {
      next(err);
    }
    if (!alias) return next(new ApplicationError({}, `Couldn't find alias`)); // throw from getAlias?
    // should authorize that owner of alias is req.user
    if (alias.user.toString() !== req.user._id.toString()) {
      return next(
        new ApplicationError(
          { currentUser: req.user._id, owner: alias.user },
          `Not Authorized. Cannot add wishlist to alias that doesn't belong to logged in user. User:${req.user._id}. Owner: ${alias.user}`
        )
      );
    }
  }
  if (req.method === 'PUT' || req.method === 'DELETE') {
    let wishlist;
    try {
      wishlist = await wishlistService.getWishlist(req.params.id);
    } catch (err) {
      next(err);
    }
    // should authorize that user of wishlist is req.user
    if (wishlist.user.toString() !== req.user._id.toString()) {
      return next(
        new ApplicationError(
          { currentUser: req.user._id, owner: wishlist.user },
          `Not Authorized. Wishlist doesn't belong to logged in user. User:${req.user._id}. Owner: ${wishlist.user}`
        )
      );
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
    return res.json(wishlist);
  });

  // wishlistRoutes.get('/:id', throwIfNotAuthorizedResource, (req, res) => {
  //   logger.log('silly', `getting wishlist by id`);

  //   const { id } = req.params;
  //   let wishlist;
  //   try {
  //     wishlist = await wishlistService.getWishlist(id);
  //   } catch (err) {
  //     return next(err);
  //   }

  //   return res.json(wishlist);
  // });

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
