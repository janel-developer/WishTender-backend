const express = require('express');
const csrf = require('csurf');
const csrfProtection = csrf();

const passport = require('passport');
const { RateLimiterMongo } = require('rate-limiter-flexible');
const mongoose = require('mongoose');

const { body, param, validationResult, sanitize } = require('express-validator');
const UserModel = require('../models/User.Model');
const UserService = require('../services/UserService');
const AliasModel = require('../models/Alias.Model');
const AliasService = require('../services/AliasService');
const { onlyAllowInBodySanitizer, throwIfExpressValidatorError } = require('./middlewares');

const aliasService = new AliasService(AliasModel);
const logger = require('../lib/logger');
const { ApplicationError } = require('../lib/Error');

const authUserLoggedIn = (req, res, next) => {
  if (req.user) {
    return next();
  }
  res.status(401).send({ message: 'No user logged in' });
};
function authUserIsParamUser(req, res, next) {
  logger.log('silly', `authorizing...`);
  if (req.user._id != req.params.id) {
    return res.status(403).send({ message: `User doesn't own resource.` });
  }
  return next();
}

const userRoutes = express.Router();
const userService = new UserService(UserModel);
module.exports = () => {
  // ---rate limiter flexible--------
  const maxFails = 5;
  const limiterConsecutiveFailsByEmail = new RateLimiterMongo({
    storeClient: mongoose.connection,
    keyPrefix: 'login_fail_consecutive_username',
    points: maxFails,
    duration: 60 * 60 * 3, // Store number for three hours since first fail
    blockDuration: 60 * 15, // Block for 15 minutes
  });
  // ---------------------------------

  /*
   * POST /login
   * {email: String, password: String}
   *
   * authenticates user
   *
   * res redirect
   */
  userRoutes.post(
    '/login',

    onlyAllowInBodySanitizer(['password', 'email']),

    body('email', `Invalid email.`).isEmail(),
    throwIfExpressValidatorError,
    async (req, res, next) => {
      passport.authenticate(
        'local',
        {
          successRedirect: '/api/users/login?error=false',
          failureRedirect: `/api/users/login?error=true&email=${req.body.email}`,
          failureFlash: true,
        },
        async (err, account) => {
          const msg = req.flash('error')[0];
          const { email } = req.body;
          if (email) {
            const rlResUsername = await limiterConsecutiveFailsByEmail.get(email);
            if (rlResUsername !== null && rlResUsername.consumedPoints > maxFails) {
              const retrySecs = Math.round(rlResUsername.msBeforeNext / 1000) || 1;
              res.set('Retry-After', String(retrySecs));
              return res.status(429).send({
                message: `Too many login attempts. Try again in ${Math.round(
                  retrySecs / 60
                )} minutes.`,
              });
            }
          }
          if (msg) {
            try {
              if (email) await limiterConsecutiveFailsByEmail.consume(email);

              return res.status(401).send({ message: msg });
            } catch (rlRejected) {
              if (rlRejected instanceof Error) {
                throw rlRejected;
              } else {
                res.set('Retry-After', String(Math.round(rlRejected.msBeforeNext / 1000)) || 1);
                logger.log(
                  'warn',
                  `rate limited logins IP ${
                    (req.headers['x-forwarded-for'] &&
                      req.headers['x-forwarded-for'].split(',').shift()) ||
                    (req.socket && req.socket.remoteAddress)
                  }`
                );
                return res.status(429).send({
                  message: `Too many login attempts. Try again in ${Math.round(
                    rlRejected.msBeforeNext / 1000 / 60
                  )} minutes.`,
                });
              }
            }
          }
          if (err) {
            throw err;
          }
          req.logIn(account, async () => {
            const alias = await aliasService.getAliasById(req.user.aliases[0]);
            return res.status(200).send({ profile: alias.handle_lowercased });
          });
        }
      )(req, res, next);
    }
  );

  userRoutes.post('/logout', async (req, res) => {
    logger.log('silly', `logging out`);
    req.session.destroy();
    req.logout();
    return res.status(201).send();
  });

  userRoutes.post(
    '/registration',
    onlyAllowInBodySanitizer(['password', 'email']),

    body('email', `No email is included.`).exists(),
    body('password', `No password is included.`).exists(),
    throwIfExpressValidatorError,
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

  // csrfProtection to send csrf token

  userRoutes.get('/current', csrfProtection, async (req, res, next) => {
    logger.log('silly', `getting current user`);

    let user;
    if (req.user) {
      user = req.user.toJSON();
      // logger.log('silly', JSON.stringify(user));
      user.csrfToken = req.csrfToken();
      return res.status(200).send(user);
    }
    // logger.log('silly', `no user`);
    res.sendStatus(204);
  });

  // userRoutes.get('/hardDelete', async (req, res, next) => {
  //   const user = await UserModel.findOneWithDeleted({ _id: '60bd7714662a8352356e4c71' });
  //   await user.remove();
  //   // await userService.hardDeleteUser('60bd7714662a8352356e4c71');
  //   res.sendStatus(204);
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

  userRoutes.patch(
    '/',

    onlyAllowInBodySanitizer(['password', 'email']),
    body('order.buyerInfo.email', `Invalid email.`).isEmail(),

    body('email', `Password must be included to update email.`).custom(
      (email, { req }) => !!req.body.password
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

    throwIfExpressValidatorError,
    authUserLoggedIn,
    async (req, res, next) => {
      delete req.body.password;
      await userService.updateUser(req.user._id, req.body);
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
    onlyAllowInBodySanitizer(['password', 'phrase']),
    body('phrase', `You must type out 'permanently delete'.`).exists(),
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
    throwIfExpressValidatorError,
    authUserLoggedIn,
    authUserIsParamUser,
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
