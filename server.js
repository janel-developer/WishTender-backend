const express = require('express');

const app = express();
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');
const flash = require('connect-flash');

const PORT = 4000;
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);
// const cookieSession = require("cookie-session");
const cookieParser = require('cookie-parser');
const axios = require('axios');
const WishModel = require('./models/Wish.Model');
const UserModel = require('./models/User.Model');
const WishesService = require('./services/WishesService'); //Why is it a good idea to have the services centrally located?
const auth = require('./lib/auth');
const routes = require('./routes');

const wishesService = new WishesService(WishModel);

app.set('trust proxy', 1);

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use((req, res, next) => {
  res.on('finish', () => {
    console.log('finished', req.url, res.statusCode);
  });
  next();
});

// Use the session middleware
app.use(
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
  try {
    req.session.visits = req.session.visits ? req.session.visits + 1 : 1;
    return next();
  } catch (err) {
    return next(err);
  }
});
app.use('/', routes({ wishesService, UserModel }));

mongoose.connect('mongodb://127.0.0.1:27017', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
});

const { connection } = mongoose;

connection.once('open', () => {
  console.log('mongoDB connection established successfully');
});

app.listen(PORT, () => {
  console.log(`Server is running on Port: ${PORT}`);
});
