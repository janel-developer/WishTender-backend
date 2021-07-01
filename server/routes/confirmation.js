const { RateLimiterMongo } = require('rate-limiter-flexible');
const mongoose = require('mongoose');
const express = require('express');
const Token = require('../models/Token.Model');
const User = require('../models/User.Model');

const ConfirmationEmailService = require('../services/ConfirmationEmailService');

const confirmationEmailService = new ConfirmationEmailService();
const confirmationRoutes = express.Router();
const logger = require('../lib/logger');
const { ApplicationError } = require('../lib/Error');

async function authNotConfirmed(req, res, next) {
  logger.log('silly', `authorizing user is not confirmed...`);
  try {
    const user = await User.findOne({ email: req.body.email });
    if (user.confirmed) {
      logger.log('silly', `User already confirmed.`);
      return res.status(409).send({ message: 'Account already confirmed' });
    }
    req.userToBeConfirmed = user;
    return next();
  } catch (err) {
    return next(
      new ApplicationError(
        { err },
        `Couldn't authorize that user is not confirmed because of an internal error.`
      )
    );
  }
}

const resendRateLimit = async (req, res, next) => {
  // ---rate limiter flexible--------
  const maxSends = 2;
  const limiterConsecutiveResendsByEmail = new RateLimiterMongo({
    storeClient: mongoose.connection,
    keyPrefix: 'confirmation_resends_consecutive_email',
    points: maxSends,
    duration: 60 * 60 * 3, // Store number for three hours since first fail
    blockDuration: 60 * 15, // Block for 15 minutes
  });
  const { email } = req.body;
  if (email) {
    const rlResUsername = await limiterConsecutiveResendsByEmail.get(email);
    if (rlResUsername !== null && rlResUsername.consumedPoints > maxSends) {
      const retrySecs = Math.round(rlResUsername.msBeforeNext / 1000) || 1;
      res.set('Retry-After', String(retrySecs));
      return res.status(429).send({
        message: `Too many confirmation resend attempts. Try again in ${Math.round(
          retrySecs / 60
        )} minutes.`,
      });
    }
    try {
      await limiterConsecutiveResendsByEmail.consume(email);
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
          message: `Too many confirmations resent. Try again in ${Math.round(
            rlRejected.msBeforeNext / 1000 / 60
          )} minutes.`,
        });
      }
    }
    return next();
  }
  return next();
};
// ---------------------------------
module.exports = () => {
  /*
   * POST
   * { email: email}
   *
   * re-sends confirmation email
   *
   * res 201
   */
  // not checking if logged in because the email could open a different browser
  // rate limit to prevent getting our email marked as spam (e.g. someone wants to sabotage me so they create WT accounts with other people's emails. They resend confirmation emails over and over so people mark it as spam and then our email address is f***ed)
  confirmationRoutes.post('/resend', authNotConfirmed, resendRateLimit, async (req, res, next) => {
    try {
      await confirmationEmailService.send(req.userToBeConfirmed);
      return res.status(200).send();
    } catch (err) {
      return next(
        new ApplicationError({ err }, `Couldn't send email because of an internal error.`)
      );
    }
  });

  /*
   * GET /:email/:token
   *
   * Forwarding confirm email form
   *
   * res 302
   */
  confirmationRoutes.get('/:email/:token', (req, res, next) => {
    logger.log('silly', 'Forwarding to confirm email form');
    res.redirect(
      302,
      `${process.env.FRONT_BASEURL}/confirm-email?email=${req.params.email}&token=${req.params.token}`
    );
  });
  /*
   * PATCH /:email/:token
   *
   * confirms email on user account
   *
   * res 200
   */
  confirmationRoutes.patch('/confirm', (req, res, next) => {
    try {
      const { token, email } = req.body;
      Token.findOne({ token }, function (err, tkn) {
        // token is not found into database i.e. token may have expired
        if (!tkn) {
          return res.status(410).send({
            message:
              'Your verification link may have expired. Please click on resend to verify your Email.',
          });
        }
        // if token is found then check valid user

        User.findOne({ _id: tkn.user, email }, function (err, user) {
          // not valid user
          if (!user) {
            return res.status(404).send({ message: `Couldn't confirm email. User doesn't exist` });
          }
          // user is already verified
          if (!user.confirmed) {
            user.confirmed = true;
            user.save();
            // login incase confirmed on another browser
            if (!req.user) {
              req.login(user, (error) => {
                if (error) {
                  return next(err);
                }
                logger.log('silly', `user logged in`);
              });
            }
          }

          return res.status(200).send();
        });
      });
    } catch (err) {
      return next(
        new ApplicationError({ err }, `Couldn't confirm email because of an internal error.`)
      );
    }
  });

  return confirmationRoutes;
};
