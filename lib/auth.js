const passport = require('passport');
const LocalStrategy = require('passport-local');
const UserModel = require('../models/User.Model');

passport.use(
  new LocalStrategy(
    {
      usernameField: 'email',
    },
    async (username, password, done) => {
      try {
        console.log(`-------trying to login ${username} -------`);
        const user = await UserModel.findOne({ email: username }).exec();
        if (!user) {
          console.log(`Invalid Username`);
          return done(null, false, { message: 'Invalid Username.' });
        }
        const passwordOK = await user.comparePassword(password);
        if (!passwordOK) {
          console.log(`Invalid Password`);
          return done(null, false, { message: 'Invalid Password.' });
        }
        console.log(`about to return done`);
        return done(null, user);
      } catch (err) {
        console.log(`error logging in: ${err}`);
        return done(null);
      }
    }
  )
);

// eslint-disable-next-line no-underscore-dangle
passport.serializeUser((user, done) => done(null, user._id));

passport.deserializeUser(async (id, done) => {
  try {
    const user = await UserModel.findById(id).exec();
    return done(null, user);
  } catch (err) {
    return done(err);
  }
});

module.exports = {
  initialize: passport.initialize(),
  session: passport.session(),
  setUser: (req, res, next) => {
    res.locals.user = req.user;
    return next();
  },
};
