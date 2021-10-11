const express = require('express');
const puppeteer = require('puppeteer');

// const bodyParser = require('body-parser');
const cors = require('cors');
const helmet = require('helmet');
const mongoose = require('mongoose');
const flash = require('connect-flash');
const RateLimit = require('express-rate-limit');
const RateMongoStore = require('rate-limit-mongo');

const mongoSanitize = require('express-mongo-sanitize');

const UserModel = require('./models/User.Model');

const { getAcceptableDomain, isPhoneDebugging } = require('./utils/utils');

const session = require('express-session');
const SessionMongoStore = require('connect-mongo')(session);
const cookieParser = require('cookie-parser');
// const testEmail = require('./lib/testemail');
const { ApplicationError } = require('./lib/Error');
require('dotenv').config({ path: `${__dirname}/./../../.env` });

const setLocaleCookie = require('./lib/setLocaleCookie');
const auth = require('./lib/auth');
const handleError = require('./lib/handleError');
const logger = require('./lib/logger');
const routes = require('./routes');
const { default: Axios } = require('axios');

if (process.env.NODE_ENV === 'production') {
  process.env.FRONT_BASEURL = 'https://www.wishtender.com';
  process.env.API_BASEURL = 'https://api.wishtender.com';
} else if (process.env.NODE_ENV === 'development' && process.env.REMOTE === 'true') {
  // staging environment is set up this way ^
  process.env.FRONT_BASEURL = 'https://staging.wishtender.com';
  process.env.API_BASEURL = 'https://api-staging.wishtender.com';
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
    'chrome-extension://khafbdpkfodbigppgcpmnokmbkhhmpfc',
    'chrome-extension://jmfmpnjaeknofpgafaickkcpnonbebcj',
  ];
  if (process.env.NODE_ENV !== 'production') origins.push('http://localhost:3000');
  console.log('allowed origins', origins);
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
          console.log('origin----', origin);
          console.log('origins----', origin);
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
  // app.use(bodyParser.json());
  // app.use(bodyParser.urlencoded({ extended: true }));
  app.use('/api/stripeWebhooks', express.raw({ limit: '100kb', type: 'application/json' }));

  app.use('/api/wishes/scrapeHtml', express.json({ limit: '3000kb' }));
  app.use(express.json({ limit: '100kb' }));

  app.use(cookieParser());
  app.use(setLocaleCookie);

  app.use(mongoSanitize());
  app.use(helmet());

  // Use the session middleware

  app.use((req, res, next) =>
    session({
      secret: process.env.SESSION_SECRET, // to do, make environment variable for production
      resave: true,
      saveUninitialized: false,
      store: new SessionMongoStore({ mongooseConnection: mongoose.connection }),
      // proxy: true,
      cookie: {
        maxAge: 7 * 24 * 60 * 60 * 1000, // this is the key;
        domain: getAcceptableDomain(req),
        // the REMOTE environment is a live environment but it is not necessarily production, ex a staging environment
        secure: !!(process.env.NODE_ENV === 'production' || process.env.REMOTE),
        httpOnly: true,
        sameSite: process.env.NODE_ENV === 'production' || process.env.REMOTE ? 'none' : true,
      },
    })(req, res, next)
  );

  app.use((req, res, next) => {
    console.log('sessionID: ', req.sessionID);
    const print = JSON.parse(JSON.stringify(req.body));
    if (print.password) print.password = 'obscured';
    if (print.masterKey) print.masterKey = 'obscured';

    console.log('req.body: ', print);
    next();
  });
  app.use(auth.initialize);
  app.use(auth.session);

  // --------------rate limiter------------

  const limiter = new RateLimit({
    store: new RateMongoStore({
      uri:
        'mongodb+srv://dash:wish12345@wtdev.z6ucx.mongodb.net/myFirstDatabase?retryWrites=true&w=majority',

      expireTimeMs: 5 * 60 * 1000,
      errorHandler: console.error.bind(null, 'rate-limit-mongo'),
    }),
    message: 'Too many requests. Try again in 15 minutes.',
    max: 500,
    windowMs: 5 * 60 * 1000,
  });

  //  apply to all requests
  app.use(limiter);

  // --------------------------------------

  // app.use((req, res, next) => {
  //   //   req.session.p = 1;
  //   //   console.log('req.headers: ', req.headers);
  //   //   console.log('req.body: ', req.body);
  //   //   console.log('req.cookies: ', req.cookies);
  //   //   console.log('req.user: ', req.user);

  //   res.on('close', async () => {
  //     console.log('req', req);
  //     console.log('res.statusCode', res.statusCode);
  //     console.log('res.statusMessage', res.statusMessage);
  //     console.log('res.headers', res._headers);
  //     console.log('set-cookie', res._headers['set-cookie']);
  //   });
  //   next();
  // });
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

  app.use(async (req, res, next) => {
    try {
      if (!req.user) return next();

      if (!req.user.userActivity) {
        await UserModel.findOneAndUpdate(
          { _id: req.user._id },
          { $set: { userActivity: { hourly: [new Date()] } } },
          { upsert: true, new: true }
        );
      } else if (
        new Date() - req.user.userActivity.hourly[req.user.userActivity.hourly.length - 1] >
        3600000
      ) {
        const newHourly = [...req.user.userActivity.hourly];
        newHourly.push(new Date());
        await UserModel.findOneAndUpdate(
          { _id: req.user._id },
          { $set: { userActivity: { hourly: [...newHourly] } } },
          { upsert: true, new: true }
        );
      }
    } catch (err) {
      throw new ApplicationError({ err }, `Internal error setting user activity`);
    }

    return next();
  });

  app.use('/api', routes());
  app.set('views', __dirname + '/views');
  app.set('view engine', 'pug');

  app.use('/', (req, res) => {
    console.warn(new Date().toISOString(), req.method, req.originalUrl, '404');
    return res.status(404).render('404');
  });

  app.use(handleError);
  // process.on('uncaughtException', function (err) {
  //   console.log(err);
  // });
  return app;
};
