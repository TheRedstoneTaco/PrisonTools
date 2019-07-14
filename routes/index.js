var express = require("express");
var router  = express.Router();
var middleware = require("../middleware/index.js");

// quick test router
router.get("/quicksite", function(req, res) {
  res.render("quicksite.ejs");
});

// ROOT route, render index page
router.get("/", function(req, res) {
    res.render("index.ejs");
});

module.exports = router;
