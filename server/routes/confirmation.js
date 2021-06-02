// It is GET method, you have to write like that
//    app.get('/confirmation/:email/:token',confirmEmail)

// It is GET method, you have to write like that
//    app.get('/confirmation/:email/:token',confirmEmail)
const Token = require('../models/Token.Model');
const User = require('../models/User.Model');
const express = require('express');
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
  } catch (error) {
    return next(
      new ApplicationError({}, `Couldn't authorize that user is not confirmed: ${error}`)
    );
  }
}

module.exports = () => {
  /*
   * POST
   * { email: email}
   *
   * re-sends confirmation email
   *
   * res 201
   */
  confirmationRoutes.post('/resend', authNotConfirmed, async (req, res, next) => {
    try {
      await confirmationEmailService.send(req.userToBeConfirmed);
      return res.status(201).send();
    } catch (error) {
      return next(new ApplicationError({}, `Couldn't send email: ${error}`));
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
      `http://localhost:3000/confirm-email?email=${req.params.email}&token=${req.params.token}`
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
            res.status(404).send({ message: `Couldn't confirm email. User doesn't exist` });
          }
          // user is already verified
          if (!user.confirmed) {
            user.confirmed = true;
            user.save();
          }

          return res.status(200).send();
        });
      });
    } catch (error) {
      return next(new ApplicationError({}, `Couldn't Confirm: ${error}`));
    }
  });

  return confirmationRoutes;
};
