const express = require('express');
const passport = require('passport');
const { default: Axios } = require('axios');
const UserModel = require('../models/User.Model');
const UserService = require('../services/UserService');
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
    const flashmsg = req.flash('error');
    if (req.query.error === 'false') return res.send(`Welcome `);
    return res.send(`You were redirected because your login failed: ${flashmsg}`);
  });

  userRoutes.post('/registration', async (req, res, next) => {
    console.log('----------------registration');
    try {
      const user = userService.addUser({
        username: req.body.username,
        email: req.body.email,
        password: req.body.password,
      });
      return res.send(user);
    } catch (err) {
      next(err);
    }
  });

  userRoutes.get('/:id', async (req, res, next) => {
    const { id } = req.params;
    try {
      const user = await userService.getUser(id);
      return res.send(user);
    } catch (err) {
      next(err);
    }
  });
  userRoutes.put('/:id', async (req, res, next) => {
    const { id } = req.params;
    const updates = req.body;
    try {
      const user = await userService.updateUser(id, updates);
      return res.send(user);
    } catch (err) {
      next(err);
    }
  });
  userRoutes.put('/:id', async (req, res, next) => {
    const { id } = req.params;
    const updates = req.body;
    try {
      const user = await userService.updateUser(id, updates);
      return res.send(user);
    } catch (err) {
      next(err);
    }
  });

  return userRoutes;
};
