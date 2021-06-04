const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');
const flash = require('connect-flash');
const expressValidator = require('express-validator');
const { getAcceptableDomain, isLocalhost, isPhoneDebugging } = require('./utils/utils');

const session = require('express-session');
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
  process.env.FRONT_BASEURL = 'https://www.wishtender.com/';
  process.env.API_BASEURL = 'https://wishtender.com/';
} else {
  process.env.FRONT_BASEURL = 'http://localhost:3000';
  process.env.API_BASEURL = 'http://localhost:4000';
}

module.exports = (config) => {
  const app = express();
  app.locals.title = config.sitename;

  app.set('trust proxy', 1);

  const origins = [
    'https://wishtenderstaging.netlify.app',
    'https://wishtenderdev.netlify.app',
    'https://wishtender.netlify.app',
    'https://www.wishtender.com',
    'https://staging.wishtender.com',
  ];
  if (process.env.NODE_ENV !== 'production') origins.push('http://localhost:3000');
  app.use((req, res, next) => {
    logger.log('silly', `${req.method}: ${req.path}`);

    cors({
      credentials: true,
      origin(origin, callback) {
        // allow requests with no origin
        // (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        if (isPhoneDebugging(req)) origins.push(origin);
        if (origins.indexOf(origin) === -1) {
          const msg =
            'The CORS policy for this site does not allow access from the specified Origin.';
          return callback(new Error(msg), false);
        }
        return callback(null, true);
      },
    })(req, res, next);
  });
  app.use((req, res, next) => {
    let allowedOrigin;
    if (req.get('origin')) {
      // couldn't someone just add a key in postman to origin? is that ok? Maybe in production change this so allowedOrigin it's hard coded, not dynamic
      allowedOrigin = origins.includes(req.get('origin')) ? req.get('origin') : '';
    } else if (req.headers.referer) {
      const reg = /(http:\/\/|https:\/\/)(.*)(?=\/)|(http:\/\/|https:\/\/)(.*)/g;
      const origin = req.headers.referer.match(reg)[0];
      allowedOrigin = origins.includes(origin) ? origin : '';
    }
    console.log('allowedOrigin', allowedOrigin);
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With, Accept,Content-Type');
    res.setHeader('Access-Control-Allow-Origin', allowedOrigin || '');
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

  app.use((req, res, next) =>
    session({
      secret: 'very secret 12345', // to do, make environment variable for production
      resave: true,
      saveUninitialized: false,
      store: new MongoStore({ mongooseConnection: mongoose.connection }),
      // proxy: true,
      cookie: {
        domain: getAcceptableDomain(req),
        secure: !!(process.env.NODE_ENV === 'production' || process.env.REMOTE),
        httpOnly: true,
        sameSite: process.env.NODE_ENV === 'production' || process.env.REMOTE ? 'none' : true,
      },
    })(req, res, next)
  );

  app.use(auth.initialize);
  app.use(auth.session);

  app.use((req, res, next) => {
    req.session.p = 1;
    // console.log('req.headers: ', req.headers);
    // console.log('req.body: ', req.body);
    // console.log('req.cookies: ', req.cookies);
    // console.log('req.user: ', req.user);

    res.on('close', () => {
      // console.log('res.statusCode', res.statusCode);
      // console.log('res.statusMessage', res.statusMessage);
      // console.log('res.headers', res._headers);
    });
    next();
  });
  app.use(auth.setUser);

  app.use(flash());
  app.use(async (req, res, next) => {
    if (!req.session.languageCode) [req.session.languageCode] = req.acceptsLanguages();
    next();
  });

  app.use(async (req, res, next) => {
    logger.log('silly', `${req.method}: ${req.path}`);
    try {
      // req.session.visits = req.session.visits ? req.session.visits + 1 : 1;
      return next();
    } catch (err) {
      return next(err);
    }
  });

  app.get('/api/k', (req, res, next) => {
    res.status(201).send({ user: 90 });
  });
  app.use('/api', routes());
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
