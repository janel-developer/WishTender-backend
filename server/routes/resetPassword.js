const { RateLimiterMongo } = require('rate-limiter-flexible');
const mongoose = require('mongoose');
const { body, param, validationResult, sanitize } = require('express-validator');

const express = require('express');
const Token = require('../models/Token.Model');
const User = require('../models/User.Model');
const ResetPasswordEmailService = require('../services/ResetPasswordEmailService');
require('dotenv').config();

const { throwIfExpressValidatorError } = require('./middlewares');

const resetPasswordEmailService = new ResetPasswordEmailService();
const resetPasswordRoutes = express.Router();
const logger = require('../lib/logger');
const { ApplicationError } = require('../lib/Error');
// ---rate limiter flexible--------

const resetRateLimit = async (req, res, next) => {
  // ---rate limiter flexible--------

  const maxSends = 2;
  const limiterPasswordResetsByEmail = new RateLimiterMongo({
    storeClient: mongoose.connection,
    keyPrefix: 'Password_resets',
    points: maxSends,
    duration: 60 * 60 * 3, // Store number for three hours since first fail
    blockDuration: 60 * 15, // Block for 15 minutes
  });
  const { email } = req.body || req.user;
  const rlResUsername = await limiterPasswordResetsByEmail.get(email);
  if (rlResUsername !== null && rlResUsername.consumedPoints > maxSends) {
    const retrySecs = Math.round(rlResUsername.msBeforeNext / 1000) || 1;
    res.set('Retry-After', String(retrySecs));
    return res.status(429).send({
      message: `Too many password reset attempts. Try again in ${Math.round(
        retrySecs / 60
      )} minutes.`,
    });
  }
  try {
    await limiterPasswordResetsByEmail.consume(email);
  } catch (rlRejected) {
    if (rlRejected instanceof Error) {
      throw rlRejected;
    } else {
      res.set('Retry-After', String(Math.round(rlRejected.msBeforeNext / 1000)) || 1);
      logger.log(
        'warn',
        `rate limited confirmation resends IP ${
          (req.headers['x-forwarded-for'] && req.headers['x-forwarded-for'].split(',').shift()) ||
          (req.socket && req.socket.remoteAddress)
        }`
      );
      return res.status(429).send({
        message: `Too many password resets sent. Try again in ${Math.round(
          rlRejected.msBeforeNext / 1000 / 60
        )} minutes.`,
      });
    }
  }
  return next();
};
// ---------------------------------

module.exports = () => {
  // post and not patch because we're creating a new token
  resetPasswordRoutes.post(
    '/',

    (req, res, next) => {
      if (!req.body.email && !req.user) {
        res.status(400).send({ message: 'No user or email address included in request.' });
      }
      next();
    },

    async (req, res, next) => {
      if (req.body.email) {
        try {
          req.selectedUser = await User.findOne({ email: req.body.email });
          if (!req.selectedUser) {
            logger.log('silly', `Invalid email`);
            res.status(400).send({ message: 'No user found with email address.' });
          }
        } catch (error) {
          throw new ApplicationError({}, `Couldn't get user:${error}`);
        }
      }
    },
    resetRateLimit,

    async (req, res, next) => {
      try {
        await resetPasswordEmailService.send(req.selectedUser || req.user);
      } catch (error) {
        throw new ApplicationError({}, `Couldn't send reset password email:${error}`);
      }
      res.status(201).send();
    }
  );

  /*
   * GET /:email/:token
   *
   * Forwarding reset pw form
   *
   * res 302
   */
  resetPasswordRoutes.get('/:email/:token', (req, res, next) => {
    logger.log('silly', 'Forwarding to confirm email form');
    res.redirect(
      302,
      `${process.env.FRONT_BASEURL}/reset-password?email=${req.params.email}&token=${req.params.token}`
    );
  });
  /*
   * PATCH /:email/:token
   *
   * resets pw on user account
   *
   * res 200
   */
  resetPasswordRoutes.patch(
    '/',
    body('password', 'Must be at least 8 characters long.').isLength({ min: 8 }),
    throwIfExpressValidatorError,

    async (req, res, next) => {
      try {
        const { token, email, password } = req.body;
        const tkn = await Token.findOne({ token });
        // token is not found into database i.e. token may have expired
        if (!tkn) {
          return res.status(410).send({
            message: 'Your verification link may have expired.',
          });
        }
        // if token is found then check valid user

        const user = await User.findOne({ _id: tkn.user, email });
        // not valid user
        if (!user) {
          return res.status(404).send({ message: `Couldn't reset password. User doesn't exist` });
        }

        // reset password
        user.password = password;
        await user.save(); // the model will encrypt the password in userSchema.pre('save')
        await tkn.remove();
        if (!req.user) {
          req.login(user, function (err) {
            if (err) {
              return next(err);
            }
            logger.log('silly', `user logged in`);
            return res.status(200).send();
          });
        }

        return res.status(200).send();
      } catch (error) {
        return next(new ApplicationError({}, `Couldn't Confirm: ${error}`));
      }
    }
  );

  return resetPasswordRoutes;
};
