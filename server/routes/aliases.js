const express = require('express');
const passport = require('passport');
const AliasModel = require('../models/Alias.Model');
const AliasService = require('../services/AliasService');
const logger = require('../lib/logger');
const { ApplicationError } = require('../lib/Error');

const aliasRoutes = express.Router();
const aliasService = new AliasService(AliasModel);
function throwIfNotAuthorized(req, res, next) {
  logger.log('silly', `authorizing...`);
  // should authorize that req.user is user if adding alias
  if (req.user._id != req.body.user) {
    throw new ApplicationError(
      { currentUser: req.user._id, owner: req.body.user },
      `Not Authorized. Cannot add alias to a different user. User:${req.user._id}. Owner: ${req.body.user} `
    );
  }

  return next();
}
async function throwIfNotAuthorizedResource(req, res, next) {
  logger.log('silly', `authorizing user owns resource...`);

  const alias = await aliasService.getAlias(req.params.id).catch(next);
  // should authorize that user of alias is req.user
  if (alias.user.toString() != req.user._id.toString()) {
    return next(
      new ApplicationError(
        { currentUser: req.user._id, owner: alias.user },
        `Not Authorized. Alias doesn't belong to logged in user. User:${req.user._id}. Owner: ${alias.user}`
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

  // aliasRoutes.get('/:id', throwIfNotAuthorizedResource, (req, res) => {
  //   logger.log('silly', `getting alias by id`);

  //   const { id } = req.params;
  //   let alias;
  //   try {
  //     alias = await aliasService.getAlias(id);
  //   } catch (err) {
  //     return next(err);
  //   }

  //   return res.json(alias);
  // });

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

  aliasRoutes.put('/:id', throwIfNotAuthorizedResource, async (req, res, next) => {
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
  aliasRoutes.delete('/:id', throwIfNotAuthorizedResource, async (req, res, next) => {
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
