var express = require("express");
var router  = express.Router();
var middleware = require("../middleware/index.js");
var User     = require("../models/user.js");

router.get("/user/:userID", function(req, res) {
  var userID = req.params.userID;
  User.findById(userID, function(err, foundUser) {
    if (err) {
      console.log("Error getting user from database:");
      console.log(err);
      return res.redirect("back");
    }
    if (!foundUser) {
      console.log("Error finding user in database!");
      return res.redirect("back");
    }
    console.log(foundUser);
    res.send(foundUser);
  });
});

module.exports = router;
