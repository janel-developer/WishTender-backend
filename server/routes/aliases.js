const express = require('express');
const passport = require('passport');
const AliasModel = require('../models/Alias.Model');
const AliasService = require('../services/AliasService');
const logger = require('../lib/logger');
const { ApplicationError } = require('../lib/Error');
const middlewares = require('./middlewares');
const ImageService = require('../services/ImageService');

const profileImageDirectory = `${__dirname}/../public/data/images/profileImages`;
const imageService = new ImageService(profileImageDirectory);

const aliasRoutes = express.Router();
const aliasService = new AliasService(AliasModel);
function throwIfNotAuthorized(req, res, next) {
  logger.log('silly', `authorizing...`);
  // should authorize that req.user is user if adding alias
  console.log(req.user);
  if (req.user._id != req.body.user) {
    throw new ApplicationError(
      { currentUser: req.user._id, owner: req.body.user },
      `Not Authorized. Cannot add alias to a different user. User:${req.user._id}. Owner: ${req.body.user} `
    );
  }

  return next();
}
async function throwIfUserNotOwner(req, res, next) {
  logger.log('silly', `authorizing user owns resource...`);

  // should authorize that user of alias is req.user
  if (!req.user.aliases.includes(req.params.id)) {
    return next(
      new ApplicationError(
        { usersAliases: req.user.aliases, alias: req.params.id },
        `Not Authorized. User doesn't own alias. User's Alias's:${req.user.aliases}. Alias: ${alias._id}`
      )
    );
  }
  return next();
}

module.exports = () => {
  aliasRoutes.post('/', throwIfNotAuthorized, async (req, res, next) => {
    logger.log('silly', `creating alias`);
    let alias;
    const values = { ...req.body };
    delete values.user;

    try {
      alias = await aliasService.addAlias(req.body.user, values);
    } catch (err) {
      return next(err);
    }
    logger.log('silly', `alias created`);
    return res.json(alias);
  });

  aliasRoutes.get('/:id', async (req, res, next) => {
    logger.log('silly', `getting alias by id`);

    const { id } = req.params;
    let alias;
    try {
      alias = await aliasService.getAliasById(id);
    } catch (err) {
      return next(err);
    }

    return res.json(alias);
  });
  aliasRoutes.get('/', async (req, res, next) => {
    logger.log('silly', `getting alias by query params`);
    const { query } = req;
    let alias;
    try {
      alias = await aliasService.getAlias(query);
    } catch (err) {
      return next(err);
    }
    logger.log('silly', `alias found: ${alias}`);
    if (!alias) return res.sendStatus(204);
    return res.status(200).send(alias);
  });

  aliasRoutes.patch(
    '/:id',
    throwIfUserNotOwner,
    middlewares.upload.single('image'),
    middlewares.handleImage(imageService, { h: 300, w: 300 }),
    async (req, res, next) => {
      try {
        const imageFile = req.file && req.file.storedFilename;
        console.log(req.body);
        const patch = { ...req.body };
        if (imageFile) patch.profileImage = `/data/images/profileImages/${imageFile}`;
        await aliasService.updateAlias(req.params.id, patch);
      } catch (err) {
        if (req.file && req.file.storedFilename) {
          await imageService.delete(req.file.storedFilename);
        }
        logger.log('silly', `alias could not be updated ${req.body}`);
        return next(
          new ApplicationError(
            { err, body: req.body }`alias could not be updated ${req.body}: ${err}`
          )
        );
      }
      return res.send(200);
    }
  );

  // userRoutes.post('/logout', (req, res) => {
  //   logger.log('silly', `logging out`);
  //   req.logout();
  //   return res.redirect('/');
  // });
  // userRoutes.post('/registration', async (req, res, next) => {
  //   logger.log('silly', `registering user`);
  //   let user;
  //   try {
  //     user = await userService.addUser({
  //       username: req.body.username,
  //       email: req.body.email,
  //       password: req.body.password,
  //     });
  //   } catch (err) {
  //     return next(err);
  //   }
  //   logger.log('silly', `user registered`);
  //   // user = user.toObject();
  //   // delete user.password;
  //   return res.json(user); // res.json(user) ?
  // });

  // userRoutes.get('/:id', async (req, res, next) => {
  //   logger.log('silly', `getting user by id`);

  //   const { id } = req.params;
  //   let user;
  //   try {
  //     user = await userService.getUser(id);
  //   } catch (err) {
  //     return next(err);
  //   }

  //   return res.json(user); // res.json(user) ?
  // });

  aliasRoutes.put('/:id', throwIfUserNotOwner, async (req, res, next) => {
    logger.log('silly', `updating alias by id`);
    const { id } = req.params;

    const updates = req.body;
    if (updates.user || updates._id)
      return next(new ApplicationError({}, `No user or id updates allowed from this route.`));
    let alias;
    try {
      alias = await aliasService.updateAlias(id, updates);
    } catch (err) {
      return next(err);
    }
    return res.json(alias);
  });
  aliasRoutes.delete('/:id', throwIfUserNotOwner, async (req, res, next) => {
    logger.log('silly', `deleting user by id`);
    const { id } = req.params;
    let alias;
    try {
      alias = await aliasService.deleteAlias(id);
    } catch (err) {
      return next(err);
    }
    return res.json(alias);
  });

  return aliasRoutes;
};
