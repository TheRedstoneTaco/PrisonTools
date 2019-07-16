var mongoose = require("mongoose");
var passportLocalMongoose = require("passport-local-mongoose");

var shopSchema = new mongoose.Schema({
  shopType: String,
  owner: String,
  offers: [{
    offerType: String,
    item: String,
    itemType: String,
    amount: Number,
    price: Number
  }]
});

module.exports = mongoose.model("Shop", shopSchema);
