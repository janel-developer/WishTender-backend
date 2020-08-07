const express = require("express");
const app = express();
const axios = require("axios");

const bodyParser = require("body-parser");
const cors = require("cors");
const mongoose = require("mongoose");
const PORT = 4000;
const routes = require("./routes");
let WishModel = require("./wish.model");

const WishesService = require("./services/WishesService"); //Why is it a good idea to have the services centrally located?

const wishesService = new WishesService(WishModel);

app.use(cors());
app.use(bodyParser.json());
app.use("/", routes({ wishesService }));

mongoose.connect("mongodb://127.0.0.1:27017", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const connection = mongoose.connection;

connection.once("open", function () {
  console.log("mongoDB connection established successfully");
});

// axios
//   .get("http://localhost:4000/wishes")
//   .then((x) => console.log(x.data))
//   .catch((x) => console.log(x.response.status, x.response.statusText));
axios
  .get("http://localhost:4000/wishes/5f1b15e60ff5670eadf4c6c8")
  .then((x) => console.log(x.data))
  .catch((x) => console.log(x.response.status, x.response.statusText));

axios
  .post("http://localhost:4000/wishes/update/5f1b15e60ff5670eadf4c6c8", {
    wish_name: "farty princess smelly",
  })
  .then((x) => console.log(x.data))
  .catch((x) => console.log(x.response.status, x.response.statusText));

// axios
//   .post("http://localhost:4000/wishes/add", {
//     wish_name: "versace 3",
//   })
//   .then((x) => console.log(x.data))
//   .catch((x) => console.log(x));
// axios
//   .delete("http://localhost:4000/wishes/delete/5f2cb85bebb1ad6048928ff")
//   .then((x) => console.log(x.data))
//   .catch((x) => console.log(x));
// axios
//   .post("http://localhost:4000/wishes/delete/many", {
//     ids: ["5f2cb84b588bdd609ae981ae"],
//   })
//   .then((x) => console.log(x.data))
//   .catch((x) => console.log(x));

app.listen(PORT, function () {
  console.log("Server is running on Port: " + PORT);
});
