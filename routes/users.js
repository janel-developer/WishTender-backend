const express = require('express');
const passport = require('passport');
const { default: Axios } = require('axios');

const userRoutes = express.Router();

module.exports = (params) => {
  const User = params;

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
  userRoutes.get('/users', async (req, res, next) => {
    try {
      await User.find((err, users) => {
        if (err) {
          console.log('err users:', users);
          console.log(err);
          return err;
        }
        console.log('users:', users);
        return users;
      }).catch(console.log);
      return res.send('oops');
    } catch (err) {
      console.log(err);
      return res.send('oops');
    }
  });
  userRoutes.post('/registration', async (req, res, next) => {
    console.log('----------------registration');
    try {
      const user = new User({
        username: req.body.username,
        email: req.body.email,
        password: req.body.password,
      });
      const saveUser = await user.save();
      if (saveUser) {
        console.log('saved user');
        return res.send(user);
      }
      // may want to validate if the user or email already exist in the database
      return res.send(new Error('Failed to save user'));
    } catch (err) {
      return res.send(`error saving user:${err}`);
    }
  });

  return userRoutes;
};
