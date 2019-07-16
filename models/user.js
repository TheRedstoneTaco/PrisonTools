var mongoose = require("mongoose");
var passportLocalMongoose = require("passport-local-mongoose");

var userSchema = new mongoose.Schema({
  username: String,
  password: String,
  authentication: Number
});

// plugin passportLocalMongoose to add functionality to the model
userSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User", userSchema);
