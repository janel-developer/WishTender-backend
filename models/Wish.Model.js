const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const Wish = new Schema({
  wish_name: { type: "string" },
});

module.exports = mongoose.model("Wish", Wish);
