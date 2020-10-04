const express = require('express');
const passport = require('passport');
const UserModel = require('../models/User.Model');
const UserService = require('../services/UserService');
const logger = require('../lib/logger');
const { ApplicationError } = require('../lib/Error');

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
  userRoutes.post(
    '/login',
    passport.authenticate('local', {
      successRedirect: '/users/login?error=false',
      failureRedirect: '/users/login?error=true',
      failureFlash: true,
    })
  );

  userRoutes.get('/login', (req, res) => {
    logger.log('silly', `getting login page`);
    const flashmsg = req.flash('error');
    if (req.query.error === 'false') return res.send(`Welcome `);
    return res.send(`You were redirected because your login failed: ${flashmsg}`);
  });
  userRoutes.post('/logout', (req, res) => {
    logger.log('silly', `logging out`);
    req.logout();
    return res.redirect('/');
  });
  userRoutes.post('/registration', async (req, res, next) => {
    logger.log('silly', `registering user`);
    let user;
    try {
      user = await userService.addUser({
        username: req.body.username,
        email: req.body.email,
        password: req.body.password,
      });
    } catch (err) {
      return next(err);
    }
    logger.log('silly', `user registered`);
    // user = user.toObject();
    // delete user.password;
    return res.json(user); // res.json(user) ?
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

  userRoutes.put('/:id', throwIfNotAuthorized, async (req, res, next) => {
    logger.log('silly', `updating user by id`);
    const { id } = req.params;

    const updates = req.body;
    if (updates.password || updates._id)
      return next(new ApplicationError({}, `No password or id updates allowed from this route.`));
    let user;
    try {
      user = await userService.updateUser(id, updates);
    } catch (err) {
      return next(err);
    }
    return res.send(user);
  });
  userRoutes.delete('/:id', throwIfNotAuthorized, async (req, res, next) => {
    logger.log('silly', `deleting user by id`);
    const { id } = req.params;
    let user;
    try {
      user = await userService.deleteUser(id);
    } catch (err) {
      return next(err);
    }
    return res.json(user);
  });

  return userRoutes;
};
