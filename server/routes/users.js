const express = require('express');
const passport = require('passport');
const { default: Axios } = require('axios');
const UserModel = require('../models/User.Model');
const UserService = require('../services/UserService');
const logger = require('../lib/logger');
const { ApplicationError } = require('../lib/Error');
const User = require('../models/User.Model');

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
      next(err);
    }
    logger.log('silly', `user registered`);
    return res.json({ username: user.username, email: user.email }); // res.json(user) ?
  });

  userRoutes.get('/:id', async (req, res, next) => {
    logger.log('silly', `getting user by id`);

    const { id } = req.params;
    try {
      const user = await userService.getUser(id);
      return res.send(user);
    } catch (err) {
      next(err);
    }
  });

  userRoutes.put('/:id', async (req, res, next) => {
    logger.log('silly', `updating user by id`);
    const { id } = req.params;
    const updates = req.body;
    let user;
    try {
      user = await userService.updateUser(id, updates);
    } catch (err) {
      next(err);
    }
    return res.send(user);
  });
  userRoutes.delete('/:id', async (req, res, next) => {
    logger.log('silly', `deleting user by id`);
    const { id } = req.params;
    let user;
    try {
      user = await userService.deleteUser(id, updates);
    } catch (err) {
      next(err);
    }
    return res.send(user);
  });

  return userRoutes;
};
