const express = require("express");
const app = express();
const axios = require("axios");

const bodyParser = require("body-parser");
const cors = require("cors");
const mongoose = require("mongoose");
const PORT = 4000;
const wishRoutes = require("./routes");

app.use(cors());
app.use(bodyParser.json());
app.use("/wishes", wishRoutes());

mongoose.connect("mongodb://127.0.0.1:27017", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
const connection = mongoose.connection;

connection.once("open", function () {
  console.log("mongoDB connection established successfully");
});

axios
  .get("http://localhost:4000/wishes")
  .then((x) => console.log(x.data))
  .catch(console.log);

app.listen(PORT, function () {
  console.log("Server is running on Port: " + PORT);
});
