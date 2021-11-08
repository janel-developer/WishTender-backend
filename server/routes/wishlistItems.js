const express = require('express');
const csrf = require('csurf');
const { createCroppedImage } = require('../lib/canvas');

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

    authLoggedIn,
    csrfProtection,
    middlewares.upload.single('image'), // for request with a blob
    middlewares.cropImage({ h: 300, w: 300 }), // for requests with a link and crop instructions
    authUserOwnsWishlistOrItem,
    middlewares.onlyAllowInBodySanitizer([
      'itemName',
      'category',
      'image',
      'itemImage',
      'imageCrop',
      'price',
      'currency',
      'url',
      'wishlist',
    ]),
    middlewares.throwIfExpressValidatorError,

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
  wishlistItemRoutes.post(
    '/multi',

    (req, res, next) => {
      if (req.body.code !== process.env.MASTER_KEY) return res.send(403).send();
      return next();
    },
    middlewares.onlyAllowInBodySanitizer(['items', 'wishlist', 'site']),

    async (req, res, next) => {
      logger.log('silly', `creating multi wishlist item`);

      // for each item
      const { site } = req.body;
      let itemsAdded = 0;
      function sleep(ms) {
        return new Promise((resolve) => setTimeout(resolve, ms));
      }
      const randomSleepTime = async (min, max) => {
        const ms = Math.floor(Math.random() * (max - min + 1) + min);
        await sleep(ms);
      };
      const addItemToDatabase = async (item, innerNext) => {
        // next declared in upper scope
        const prom = new Promise((resolve, rej) => {
          (async () => {
            let file;
            try {
              file = await createCroppedImage(
                item.imageCrop.url,
                item.imageCrop.crop,
                {
                  h: 300,
                  w: 300,
                },
                site === 'amazon' ? 'png' : null,
                next
              );
              await randomSleepTime(900, 3000);
              file.storedFilename = await imageService.store(file.buffer, { h: 300, w: 300 });
            } catch (err) {
              return innerNext(err);
            }

            const newItem = { ...item };
            newItem.itemImage = imageService.filepathToStore(file.storedFilename);
            delete newItem.imageCrop;
            try {
              const itemRes = await wishlistItemService.addWishlistItem(newItem);
              return resolve(itemRes);
            } catch (err) {
              if (req.file && req.file.storedFilename)
                await imageService.delete(req.file.storedFilename);

              return rej(err);
            }
          })();
        });
        return prom;
      };

      // sequential so not to arouse the bot detectors
      console.log('removing...');
      req.body.items
        .filter((i) => i.price === 'NaN' || !i.imageCrop)
        .forEach((i) => {
          console.log(JSON.stringify(i));
          console.log('___');
        });
      const items = req.body.items
        .filter((i) => i.price !== 'NaN' && i.imageCrop)
        .reduce(
          (prevPr, currentItemEl, i) =>
            prevPr
              .then((acc) =>
                addItemToDatabase(currentItemEl, next).then((resp) => {
                  return [...acc, resp];
                })
              ) // eslint-disable-next-line arrow-body-style
              .catch((err) => {
                return next(
                  new ApplicationError({ err }, `Failed to add items at the i=${i} item`)
                );
              }),
          Promise.resolve([])
        );
      items
        .then(async () => res.status(201).send())
        // eslint-disable-next-line arrow-body-style
        .catch((err) => {
          return next(new ApplicationError({ err }, `Failed to add items`));
        });
    }
  );

  wishlistItemRoutes.patch(
    '/:id',

    authLoggedIn,
    csrfProtection,
    middlewares.onlyAllowInBodySanitizer([
      // this is not doing anything what up
      'itemName',
      'category',
      'imageCrop',
      'price',
      'url',
      'image',
    ]),
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
        if (patch.categories === '[]') patch.categories = []; // could not figure out how to send an empty array in form data, keeps sending as a string
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
    '/multi',
    (req, res, next) => {
      if (req.body.code !== process.env.MASTER_KEY) return res.send(403).send();
      return next();
    },
    // authLoggedIn,
    // authUserOwnsWishlistOrItem,
    async (req, res, next) => {
      logger.log('silly', `deleting wishlist item by id`);
      // const { id } = req.params;
      const { ids, batch } = req.body;
      let items;
      try {
        if (ids) {
          items = await wishlistItemService.getWishlistItems(ids);
        } else if (batch) {
          items = await wishlistItemService.getWishlistItemsByBatch(batch);
        }
      } catch (err) {
        return next(new ApplicationError({ err }, `Failed to get items`));
      }
      const deleteItem = async (item) => {
        try {
          if (!item.orders.length) {
            await wishlistItemService.deleteHardWishlistItem(item._id, imageService);
          } else {
            await wishlistItemService.deleteWishlistItem(item._id);
            return;
          }
          return;
        } catch (err) {
          next(err);
        }
      };

      const itemsToDelete = items.map((it) => it._id.toJSON());
      // sequential just to keep easy to denug but this is slow and shouldn't be used in production
      const prom = items.reduce(
        (prevPr, currentItem, i) =>
          prevPr
            .then((acc) => {
              return deleteItem(currentItem).then((resp) => {
                return [...acc, resp];
              });
            })
            // eslint-disable-next-line arrow-body-style
            .catch((err) => {
              return next(new ApplicationError({ err }, `Failed to add items at the i=${i} item`));
            }),
        Promise.resolve([])
      );
      prom
        .then(async (p) => {
          console.log(p);
          return res.status(204).send();
        })
        // eslint-disable-next-line arrow-body-style
        .catch((err) => {
          return next(
            new ApplicationError(
              { err },
              `Failed to delete all items. Items not deleted: ${itemsToDelete.join(', ')}`
            )
          );
        });
      // await new Promise((resolve) => {
      //   items.forEach(async (item) => {
      //     try {
      //       await deleteItem(item);
      //       const index = itemsToDelete.indexOf(item._id.toJSON());
      //       itemsToDelete.splice(index, 1);
      //       if (!itemsToDelete.length) return resolve();
      //     } catch (err) {
      //       return next(
      //         new ApplicationError(
      //           { err },
      //           `Failed to delete all items. Items not deleted: ${itemsToDelete.join(', ')}`
      //         )
      //       );
      //     }
      //   });
      // });

      // return res.status(204).send();
    }
  );

  wishlistItemRoutes.delete(
    '/:id',
    (req, res, next) => {
      // if (req.body.code !== process.env.MASTER_KEY) return res.send(403).send();
      return next();
    },
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
