var express = require("express");
var router  = express.Router();
var middleware = require("../middleware/index.js");
var User = require("../models/user.js");
var Shop = require("../models/shop.js");

// GET: get all shops!
router.get("/shops", middleware.isLoggedIn, function(req, res) {
  Shop.find({}, function(err, foundShops) {
    if (err) {
      console.log("Error finding the shops!");
      console.log(err);
      return res.send(500);
    }
    if (!foundShops) {
      console.log("Shops not found!");
      return res.send(500);
    }
    return res.send(foundShops);
  });
});

// CREATE: create a shop
router.post("/shops", middleware.isLoggedIn, function(req, res) {
  var newShop = {
    shopType: "player",
    owner: req.body.owner,
    offers: req.body.offers
  };
  Shop.create(newShop, function(err, createdShop) {
    if (err) {
      console.log("Error creating shop: ");
      console.log(err);
      return res.redirect("/");
    }
    if (!createdShop) {
      console.log("No shop created!");
      return res.redirect("/");
    }
    return res.sendStatus(200);
  });
});

// UPDATE: edit a shop
router.put("/shops/:shopID", middleware.isLoggedIn, function(req, res) {
  var shopID = req.params.shopID;
  Shop.findById(shopID, function(err, foundShop) {
    if (err) {
      console.log("Error trying to update shop:");
      console.log(err);
      return res.redirect("/");
    }
    if (!foundShop) {
      console.log("Shop not found in order to update!");
      return res.redirect("/");
    }
    foundShop.owner = req.body.owner;
    foundShop.offers = req.body.offers;
    foundShop.save();
    return res.sendStatus(200);
  });
});

// DESTROY: remove a shop
router.delete("/shops/:shopID", middleware.isLoggedIn, function(req, res) {
  var shopID = req.params.shopID;
  Shop.findById(shopID, function(err, foundShop) {
    if (err) {
      console.log("Error trying to remove shop:");
      console.log(err);
      return res.redirect("/");
    }
    if (!foundShop) {
      console.log("Shop not found in order to remove!");
      return res.redirect("/");
    }
    foundShop.remove();
    return res.sendStatus(200);
  });
});

module.exports = router;
