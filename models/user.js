var mongoose = require("mongoose");
var passportLocalMongoose = require("passport-local-mongoose");

var userSchema = new mongoose.Schema({
  username: String,
  email: String,
  password: String,
  contacts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Contact"
  }],
  encounters: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Encounter"
  }],
  events: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Event"
  }]
});

// plugin passportLocalMongoose to add functionality to the model
userSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User", userSchema);
