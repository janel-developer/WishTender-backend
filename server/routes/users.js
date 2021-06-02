const express = require('express');
const passport = require('passport');
const UserModel = require('../models/User.Model');
const UserService = require('../services/UserService');
const AliasModel = require('../models/Alias.Model');
const AliasService = require('../services/AliasService');
const { body, param, validationResult, sanitize } = require('express-validator');
const { onlyAllowInBodySanitizer } = require('./middlewares');

const aliasService = new AliasService(AliasModel);
const logger = require('../lib/logger');
const { ApplicationError } = require('../lib/Error');
const auth = require('../lib/auth');
const { reset } = require('nodemon');
const { update } = require('../models/User.Model');

const authUserLoggedIn = (req, res, next) => {
  if (req.user) {
    return next();
  }
  res.status(401).send({ message: 'No user logged in' });
};
function throwIfNotAuthorized(req, res, next) {
  logger.log('silly', `authorizing...`);
  if (req.user._id != req.params.id) {
    throw new ApplicationError(
      { currentUser: req.user._id, owner: req.param.id },
      `Not Authorized ${req.user._id} ${req.params.id} `
    );
  }
  return next();
}
const userRoutes = express.Router();
const userService = new UserService(UserModel);
module.exports = () => {
  /*
   * POST /login
   * {email: String, password: String}
   *
   * authenticates user
   *
   * res 200
   */
  userRoutes.post(
    '/login',
    passport.authenticate('local', {
      successRedirect: '/api/users/login?error=false',
      failureRedirect: '/api/users/login?error=true',
      failureFlash: true,
    })
    // (req, res, next) => {
    //   const flashMsg = req.flash('error');
    //   if (flashMsg.length) {
    //     return res.status(401).send({ error: flashMsg });
    //   }
    //   return res.sendStatus(201);
    // }
  );

  userRoutes.get('/login', async (req, res) => {
    logger.log('silly', `sending login response`);
    const flashmsg = req.flash('error');
    if (req.query.error === 'false') {
      if (!req.user.aliases[0]) {
        res.status(200).send({ profile: null });
      }
      const alias = await aliasService.getAliasById(req.user.aliases[0]);
      return res.status(200).send({ profile: alias.handle_lowercased });
    }

    return res.status(401).send({ message: flashmsg });
  });

  userRoutes.post('/logout', (req, res) => {
    logger.log('silly', `logging out`);
    req.logout();
    return res.status(201).send();
  });

  userRoutes.post(
    '/registration',
    onlyAllowInBodySanitizer(['password', 'email']),

    body('email', `No email is included.`).exists(),
    body('password', `No password is included.`).exists(),
    async (req, res, next) => {
      logger.log('silly', `registering user`);
      let user;
      try {
        user = await userService.addUser(req.body);
      } catch (err) {
        return next(err);
      }
      logger.log('silly', `user registered`);
      req.login(user, (err) => {
        if (err) {
          return next(err);
        }
        logger.log('silly', `user logged in`);
        return res.status(201).send(user);
      });
    }
  );

  userRoutes.get('/current', async (req, res, next) => {
    logger.log('silly', `getting current user`);

    let user;
    if (req.user) {
      user = req.user.toJSON();
      logger.log('silly', JSON.stringify(user));
      return res.status(200).send(user);
    }
    logger.log('silly', `no user`);
    res.sendStatus(204);
  });

  userRoutes.get('/:id', async (req, res, next) => {
    logger.log('silly', `getting user by id`);

    const { id } = req.params;
    let user;
    try {
      user = await userService.getUser(id);
    } catch (err) {
      return next(err);
    }

    return res.json(user); // res.json(user) ?
  });

  userRoutes.patch(
    '/',
    onlyAllowInBodySanitizer(['password', 'email']),

    body('updates.email', `Password must be included to update email.`).custom(
      ({ req }) => !!req.body.password
    ),

    async (req, res, next) => {
      // this validation was called imperatively to get access to next()
      await body('password', `Password invalid.`)
        .optional()
        .custom(async (password) => {
          // const user = await UserModel.findOne({ email: username }).exec();
          const passwordOK = await req.user.comparePassword(password);
          if (!passwordOK) {
            logger.log(`silly`, `Invalid Password`);
            throw new Error(`Password invalid.`);
          }
          return true;
        })
        .run(req);
      next();
    },
    (req, res, next) => {
      const errors = validationResult(req).array();
      if (errors.length) {
        return res.status(400).send({ errors });
      }
      return next();
    },

    async (req, res, next) => {
      const { updates } = req.body;
      await userService.updateUser(req.user._id, updates);
      return res.status(200).send();
    }
  );

  // userRoutes.delete('/:id', authUserLoggedIn, throwIfNotAuthorized, async (req, res, next) => {
  //   logger.log('silly', `deleting user by id`);
  //   // add validations need to enter password and permentelty delete maybe have to email confirm
  //   const { id } = req.params;
  //   try {
  //     await userService.hardDeleteUser(id);
  //   } catch (err) {
  //     return next(err);
  //   }
  //   return res.status(200).send();
  // });
  userRoutes.delete(
    '/:id',
    onlyAllowInBodySanitizer(['password', 'email']),
    body('verificationPhrase', `You must type out 'permanently delete'.`).exists(),
    body('password', 'Password must be included').exists(),
    async (req, res, next) => {
      await body('password', `Password invalid.`)
        .custom(async (password) => {
          const passwordOK = await req.user.comparePassword(password);
          if (!passwordOK) {
            logger.log(`silly`, `Invalid Password`);
            throw new Error(`Password invalid.`);
          }
          return true;
        })
        .run(req);
      next();
    },
    (req, res, next) => {
      const errors = validationResult(req).array();
      if (errors.length) {
        return res.status(400).send({ message: 'Form validation errors', errors });
      }
      return next();
    },
    authUserLoggedIn,
    throwIfNotAuthorized,
    async (req, res, next) => {
      logger.log('silly', `deleting user by id`);

      const { id } = req.params;
      try {
        await userService.softDeleteUser(id);
      } catch (err) {
        return next(err);
      }
      return res.status(200).send();
    }
  );

  return userRoutes;
};
