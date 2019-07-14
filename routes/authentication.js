var express = require("express");
var router  = express.Router();
var middleware = require("../middleware/index.js");
var User     = require("../models/user.js");
var passport = require("passport");



// GET - authentication - login: Show page to login
router.get("/login", middleware.isNotLoggedIn, function(req, res) {
    res.render("login.ejs");
});
// POST - authentication - login: Log a user in
router.post("/login", function(req, res, next) {
  passport.authenticate("local", function(err, user, info) {
    if (err) {
        return next(err);
    }
    if (!user) {
        console.log("User not found in database!");
        return res.redirect('/login');
    }
    req.logIn(user, function(err) {
        if (err) {
            return next(err);
        }
        return res.redirect("/");
    });
  })(req, res, next);
});

// GET - authentication - register: Show page to register
router.get("/register", function(req, res) {
    res.render("register.ejs");
});
// POST - authentication - register: Register a user
router.post("/register", function(req, res) {

    // create temporary, blank user object
    var newUser = new User({
      username: req.body.username,
      email: req.body.email,
      password: "",
      contacts: [],
      encounters: [],
      events: []
    });

    // create new user with object, setup password, register
    User.register(newUser, req.body.password, function(error, registeredUser) {

      console.log(registeredUser);

        if (error || !registeredUser) {
            console.log("ERROR in POST: /register trying to create user " + error);
            return res.redirect("/register");
        }

        req.login(registeredUser, function (err) {
            if (err) {
                console.log(err);
                return res.redirect("/register");
            }
            res.redirect("/");
        });

    });
});

// GET - authentication - logout: Logout a user
router.get("/logout", function(req, res) {
    req.logout();
    res.redirect("/");
});

module.exports = router;
