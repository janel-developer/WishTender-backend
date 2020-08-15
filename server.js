const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const cors = require("cors");
const mongoose = require("mongoose");
const PORT = 4000;
const routes = require("./routes");
const session = require("express-session");
const MongoStore = require("connect-mongo")(session);
// const cookieSession = require("cookie-session");
const cookieParser = require("cookie-parser");
const WishModel = require("./models/Wish.Model");
const UserModel = require("./models/User.Model");
const axios = require("axios");
const WishesService = require("./services/WishesService"); //Why is it a good idea to have the services centrally located?
const wishes = require("./routes/wishes");

const wishesService = new WishesService(WishModel);

app.set("trust proxy", 1);

// app.use(
//   cookieSession({
//     name: "session",
//     keys: ["ghgjhgjh", "blahpopo"], //just testing
//   })
// );

app.use(cors());
app.use(bodyParser.json());
app.use((req, res, next) => {
  console.log(`request for: ${req.url}`); // this is what you want

  res.on("finish", () => {
    console.log("finished:", res.statusCode);
  });
  next();
});
app.use(bodyParser.urlencoded({ extended: true }));

// app.use(cookieParser());

// Use the session middleware
app.use(
  session({
    secret: "very secret 12345",
    resave: true,
    saveUninitialized: false,
    store: new MongoStore({ mongooseConnection: mongoose.connection }),
  })
);

// app.use("/", routes({ wishesService, UserModel }));

// Access the session as req.session
// app.get("/", function (req, res, next) {
//   if (req.session.visits) {
//     console.log("id:", req.session.id);
//     req.session.visits = req.session.visits ? req.session.visits + 1 : 1;
//     console.log("visits:", req.session.visits);
//   } else {
//     req.session.visits = 1;
//   }
//   res.send("welcome to the session demo. refresh!");
// });

// doesn;t work
app.use(async (req, res, next) => {
  try {
    console.log("cookie2:", req.session.cookie);
    console.log("id:", req.session.id);
    req.session.visits = req.session.visits ? req.session.visits + 1 : 1;
    console.log("visits:", req.session.visits);
    return next();
  } catch (err) {
    return next(err);
  }
});
app.use(
  "/",
  express.Router().get("/", async (req, res, next) => {
    console.log("server.js, about to send 'butt'");
    res.send("butt");
    next();
  })
);

mongoose.connect("mongodb://127.0.0.1:27017", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
});

const connection = mongoose.connection;

connection.once("open", function () {
  console.log("mongoDB connection established successfully");
});

// axios
//   .get("http://localhost:4000/", {
//     headers: {
//       withCredentials: true,
//     },
//   })
//   .then(function (response) {
//     // handle success
//     console.log("success");
//     console.log(response.data);
//   })
//   .catch(function (error) {
//     // handle error
//     console.log("error");
//     console.log(error.message);
//   });

app.listen(PORT, function () {
  console.log("Server is running on Port: " + PORT);
});
