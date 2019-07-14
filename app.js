// Libraries
var passportLocalMongoose   = require("passport-local-mongoose"),
    methodOverride          = require("method-override"),
    LocalStrategy           = require("passport-local").Strategy,
    bodyParser              = require("body-parser"),
    passport                = require("passport"),
    mongoose                = require("mongoose"),
    express                 = require("express"),
    app                     = express();

// Routes
var indexRoutes = require("./routes/index.js"),
userRoutes = require("./routes/user.js"),
authenticationRoutes = require("./routes/authentication.js");

// Models
var User = require("./models/user.js");

// robots.txt requests bother me
// https://stackoverflow.com/questions/15119760/what-is-the-smartest-way-to-handle-robots-txt-in-express
app.use(function (req, res, next) {
    if ('/robots.txt' == req.url) {
        res.type('text/plain')
        res.send("User-agent: *\nDisallow: /");
    } else {
        next();
    }
});

// database
mongoose.connect("mongodb://theredstonetaco:tacoman123@ds233970.mlab.com:33970/theredstonetaco");

// url parsing
app.use(bodyParser.urlencoded({extended: true}));
// local javascript and css files
app.use(express.static(__dirname + "/public"));
// Passport setup
app.use(require("express-session")({
    secret: "1234567890",
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(
  function(login, password, done) {
    // to login by either username or email
    var findBy;
    if (login.indexOf("@") == -1) {
        findBy = {username: login};
    } else {
        findBy = {email: login};
    }
    // now login
    User.findOne(findBy, function (err, user) {
      if (err) {
          return done(err);
      }
      if (!user) {
        return done(null, false, { message: 'Incorrect username.' });
      }
      if (password == user.password) {
        return done(null, false, { message: 'Incorrect password.' });
      }
      return done(null, user);
    });
  }
));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
// Users setup
app.use(function(request, response, next) {
    response.locals.currentUser = request.user;
    next();
});
// Method Overriding
app.use(methodOverride("_method"));

// Use the routes
app.use(indexRoutes);
app.use(userRoutes);
app.use(authenticationRoutes);

// listen
app.listen(3000, '127.0.0.1', function() {
   console.log("Server started!");
});
