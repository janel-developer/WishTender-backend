const passport = require('passport');
const Token = require('../models/Token.Model');
const User = require('../models/User.Model');
const express = require('express');
const ResetPasswordEmailService = require('../services/ResetPasswordEmailService');
require('dotenv').config();

const resetPasswordEmailService = new ResetPasswordEmailService();
const resetPasswordRoutes = express.Router();
const logger = require('../lib/logger');
const { ApplicationError } = require('../lib/Error');

module.exports = () => {
  // post and not patch because we're creating a new token
  resetPasswordRoutes.post(
    '/',

    (req, res, next) => {
      if (!req.body.email || !req.user) {
        res.status(400).send({ message: 'No user or email address included in request.' });
        return next();
      }
    },
    async (req, res, next) => {
      if (req.body.email) {
        try {
          req.selectedUser = await User.findOne({ email: req.body.email });
          if (!req.user) {
            logger.log('silly', `Invalid email`);
            res.status(400).send({ message: 'No user found with email address.' });
            next();
          }
        } catch (error) {
          throw new ApplicationError({}, `Couldn't get user:${error}`);
        }
      }
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
      `${process.env.BASEURL}/reset-password?email=${req.params.email}&token=${req.params.token}`
    );
  });
  /*
   * PATCH /:email/:token
   *
   * resets pw on user account
   *
   * res 200
   */
  resetPasswordRoutes.patch('/reset-password', async (req, res, next) => {
    try {
      const { token, email } = req.body;
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
        res.status(404).send({ message: `Couldn't confirm email. User doesn't exist` });
        return next();
      }

      // reset password
      user.password = req.body.password;
      await user.save(); // the model will encrypt the password in userSchema.pre('save')

      if (!req.user) {
        req.login(user, function (err) {
          if (err) {
            return next(err);
          }
          logger.log('silly', `user logged in`);
          return res.status(200).send();
        });
      }

      res.status(200).send();
    } catch (error) {
      return next(new ApplicationError({}, `Couldn't Confirm: ${error}`));
    }
  });

  return resetPasswordRoutes;
};
