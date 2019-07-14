var User  = require("../models/user.js");;

var middlewareObject = {};

// to check if a user is logged in
middlewareObject.isLoggedIn = function(request, response, next) {
    if(request.isAuthenticated()){
        return next();
    }
    response.redirect("/login");
};

// to make sure a user is not logged in
middlewareObject.isNotLoggedIn = function(request, response, next) {
    if(!request.isAuthenticated()){
        return next();
    }
    response.redirect("/");
};

module.exports = middlewareObject;
