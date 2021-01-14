const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');
const flash = require('connect-flash');
const expressValidator = require('express-validator');

const session = require('express-session'); //will not work in production
const MongoStore = require('connect-mongo')(session);
const cookieParser = require('cookie-parser');
require('dotenv').config({ path: `${__dirname}/./../../.env` });
const stripe = require('stripe')(
  process.env.NODE_END === 'production'
    ? process.env.STRIPE_SECRET_KEY
    : process.env.STRIPE_SECRET_TEST_KEY
);
const setLocaleCookie = require('./lib/setLocaleCookie');
const auth = require('./lib/auth');
const handleError = require('./lib/handleError');
const logger = require('./lib/logger');
const routes = require('./routes');

if (process.env.NODE_ENV === 'production') {
  process.env.BASEURL = 'https://wishtender.com/';
} else {
  process.env.BASEURL = 'http://localhost:4000';
}

module.exports = (config) => {
  const app = express();
  app.locals.title = config.sitename;

  app.set('trust proxy', 1);

  app.use(cors());
  app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With, Accept, Content-Type');
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader(
      'Access-Control-Allow-Methods',
      'GET, HEAD, POST, PUT, DELETE, TRACE, OPTIONS, PATCH'
    );
    next();
  });
  app.use(express.static(`${__dirname}/public`));
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(cookieParser());
  app.use(setLocaleCookie);

  // Use the session middleware
  app.use(
    // ['/users/current'],
    session({
      secret: 'very secret 12345',
      resave: true,
      saveUninitialized: false,
      store: new MongoStore({ mongooseConnection: mongoose.connection }),
    })
  );

  app.use(auth.initialize);
  app.use(auth.session);
  app.use(auth.setUser);

  app.use(flash());
  app.use(async (req, res, next) => {
    if (!req.session.languageCode) [req.session.languageCode] = req.acceptsLanguages();
    next();
  });

  app.use(async (req, res, next) => {
    logger.log('silly', `cookie: ${req.headers.cookie}`);
    logger.log('silly', `${req.method}: ${req.path}`);
    logger.log('silly', `sessionID: ${req.sessionID}`);
    try {
      // req.session.visits = req.session.visits ? req.session.visits + 1 : 1;
      return next();
    } catch (err) {
      return next(err);
    }
  });
  // app.get('/', (req, res) => { //testing session styff. can delete
  //   req.session.minutes = `${new Date().getMinutes()}:${new Date().getSeconds()}`;
  //   console.log(req.session);
  //   res.send('Hello World!');
  // });
  app.use('/', routes());
  app.set('views', __dirname + '/views');
  app.set('view engine', 'pug');

  app.use('/', (req, res) => {
    console.warn(new Date().toISOString(), req.method, req.originalUrl, '404');
    return res.status(404).render('404');
  });

  // error handling function
  // app.use((err, req, res, next) => {
  //   if (res.headersSent) {
  //     return next(err);
  //   }
  //   console.err(err);
  //   return res.status(500).render('500', {
  //     title: '500',
  //   });
  // });
  app.use(handleError);
  return app;
};
