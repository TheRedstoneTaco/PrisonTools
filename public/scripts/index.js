var removeOfferMode = false;
var emptyOfferJSON = {
  offerType: "Buy",
  item: "oak_wood",
  itemType: "single",
  amount: 0,
  price: 0
};
var shops = [];
var sortedOffers = {};

var userID;
var user, contacts, encounters, events;

$(document).ready(function() {

  // page navigation
  $(".nav-item").click(function(event) {
    event.preventDefault();
    $(".nav-item").removeClass("active");
    $(this).addClass("active");
    $(".section").hide();
    $(".section[section=" + $(this).find("a").attr("section") + "]").show();
  });

  // Initialize menu for adding a shop
  displayShop("#shop-add-container", {
    type: "player",
    owner: "",
    offers: [emptyOfferJSON]
  });
  $("#shop-add-container .shop").attr("id", "shop-add");

  // GET: shops
  $.ajax("/shops", {
    method: "GET",
    // when the server sends the shops
    success: function(data) {
      // set up variables
      shops = data;
      // show all shops and deals
      showShops();
      computeOffers();
      showDeals();
      // can only bind shops after they are displayed in HTML
      // so this code is placed right here!
      bindShops();
    }
  });

  // userID = $("#userID").text().trim();
  // $("#userID").remove();
  // $.ajax("/user/" + userID, {
  //   method: "GET",
  //   success: function(data) {
  //     user = data;
  //     contacts = user.contacts;
  //     encounters = user.encounters;
  //     events = user.events;
  //   }
  // });

});

function showShops() {
  // remove loader stuff
  $("#shops-getting-spinner").remove();
  // display each shop
  // display important shops first
  var important_shops = [];
  var player_shops = [];
  for (var i = 0; i < shops.length; i++) {
    if (shops[i].shopType == "mine" || shops[i].shopType == "me") {
      important_shops.push(shops[i])
    } else {
      player_shops.push(shops[i]);
    }
  }
  for (var i = 0; i < important_shops.length; i++) {
    displayShop("#shops", important_shops[i]);
  }
  for (var i = 0; i < player_shops.length; i++) {
    displayShop("#shops", player_shops[i]);
  }
}

function computeOffers() {
  // extract all offers from each shop
  // include the shops' id's and shops' owners' usernames in the extraction
  // also include a "singlePrice" field for the price of the single of each item
  // store in array "tmpOffers"
  var tmpOffers = [];
  for (var i = 0; i < shops.length; i++) {
    for (var j = 0; j < shops[i].offers.length; j++) {
      var tmpOffer = shops[i].offers[j];
      tmpOffer.shopID = shops[i]._id;
      tmpOffer.owner = shops[i].owner;
      // calculate "singlePrice" based on (price / crafting) / amount
      tmpOffer.singlePrice = 0.0;
      var divider = 1.0;
      if (tmpOffer.itemType == "single") {
        divider = 1.0;
      } else if (tmpOffer.itemType == "ore") {
        divider = 1.0;
      } else if (tmpOffer.itemType == "ingot") {
        divider = 1.0;
      } else if (tmpOffer.itemType == "block") {
        var item = tmpOffer.item;
        var twoByTwo = ["glowstone"];
        var threeByThree = ["coal", "iron", "gold", "diamond", "lapis", "redstone", "emerald"];
        if (twoByTwo.indexOf(item) != -1) {
          divider = 4.0;
        } else if (threeByThree.indexOf(item) != -1) {
          divider = 9.0;
        }
      }
      tmpOffer.singlePrice = tmpOffer.price / divider;
      tmpOffer.singlePrice = tmpOffer.singlePrice / tmpOffer.amount;
      tmpOffers.push(tmpOffer);
    }
  }
  // convert "tmpOffers" array of offers into "sortedOffers" object
  // "sortedOffers" is offers sorted by "item"
  // sort offers by item name
  for (var i = 0; i < offerDefaultJSON.items.length; i++) {
    var itemName = offerDefaultJSON.items[i];
    sortedOffers[itemName] = [];
  }
  for (var i = 0; i < tmpOffers.length; i++) {
    var tmpOffer = tmpOffers[i];
    var itemName = tmpOffer.item;
    sortedOffers[itemName].push(tmpOffer);
  }
  // sort offers by alphabetical item name
  // sort by alphabetical, then iteratively insert key and value into temporary object
  // because object is stored by the time each key and value is inserted
  // https://stackoverflow.com/questions/5467129/sort-javascript-object-by-key
  var tmpOrdered = {};
  var keys = Object.keys(sortedOffers);
  keys.sort();
  for (var i = 0; i < keys.length; i++) {
    var key = keys[i];
    tmpOrdered[key] = sortedOffers[key];
  }
  sortedOffers = tmpOrdered;
  // sort offers by "sell" and "buy"
  var keys = Object.keys(sortedOffers);
  for (var i = 0; i < keys.length; i++) {
    var key = keys[i];
    var tmpObj = {
      sell: [],
      buy: []
    };
    for (var j = 0; j < sortedOffers[key].length; j++) {
      var curOffer = sortedOffers[key][j];
      if (curOffer.offerType == "sell") {
        tmpObj.sell.push(curOffer);
      } else if (curOffer.offerType == "buy") {
        tmpObj.buy.push(curOffer);
      }
    }
    sortedOffers[key] = tmpObj;
  }
  // sort offers by price
  // SELL: low to high, BUY: high to low
  var keys = Object.keys(sortedOffers);
  for (var i = 0; i < keys.length; i++) {
    var key = keys[i];
    sortedOffers[key].sell = _.sortBy(sortedOffers[key].sell, ["singlePrice"]);
    sortedOffers[key].buy = _.sortBy(sortedOffers[key].buy, ["singlePrice"]).reverse();
  }
}

function showDeals() {
  // for each sorted offer collection
  for (var i = 0; i < Object.keys(sortedOffers).length; i++) {
    // extract information
    var itemName = Object.keys(sortedOffers)[i];
    var offers = sortedOffers[itemName];
    // show the deal
    showDeal('#deals', itemName, offers);
  }
}

function showDeal(target, itemName, offers) {
  // the html to append
  var html = ``;
  // determine if the deal is a "success" or a "failure"
  var success = "";
  var sellLength = offers.sell.length;
  // make sure there is at least one person buying and one person selling
  if (offers.buy[0] && offers.sell[0]) {
    if (offers.buy[0].singlePrice > offers.sell[sellLength - 1].singlePrice) {
      success = "true";
    } else {
      success = "false";
    }
  }
  // deal html
  html += `<div class="deal" success="` + success + `">`;
    html += `<div class="itemName">`;
      html += formatValue(itemName);
    html += `</div>`; // <./itemName>
    // show the offers
    html += `<div class="offers">`;
      // show SELL offers: low to high
      for (var i = 0; i < offers.sell.length; i++) {
        var offer = offers.sell[i];
        html += `<div class="offer" offerType="sell"`;
          // make sure there is at least one person buying and one person selling
          if (offers.buy[0] && offers.sell[0]) {
            // add in success result to highest buyer
            if (i == (offers.sell.length - 1)) {
              html += ` success="` + success + `"`;
            }
          }
        html += `>`;
          html += `<span class="owner">`;
            html += offer.owner;
          html += `</span>`;
          html += `<span class="sell-text">`;
            html += `Sell`;
          html += `</span>`;
          html += `<span class="itemType">`;
            html += offer.itemType;
          html += `</span>`;
          html += `<span class="price">`;
            html += `-$` + offer.price.toFixed(2);
          html += `</span>`;
          html += `<span class="amount">`;
            html += `X` + offer.amount;
          html += `</span>`;
          html += `<span class="equals">`;
            html += ` = `;
          html += `<span>`;
          html += `<span class="singlePrice">`;
            html += `-$` + offer.singlePrice.toFixed(2) + " per single";
          html += `</span>`;
        html += `</div>`; // <./offer[offerType=sell]>
      }
      // show BUY offers: high to low
      for (var i = 0; i < offers.buy.length; i++) {
        var offer = offers.buy[i];
        html += `<div class="offer" offerType="buy"`;
          // make sure there is at least one person buying and one person selling
          if (offers.buy[0] && offers.sell[0]) {
            // add in success result to highest buyer
            if (i == 0) {
              html += ` success="` + success + `"`;
            }
          }
        html += `>`;
          html += `<span class="owner">`;
            html += offer.owner;
          html += `</span>`;
          html += `<span class="buy-text">`;
            html += `Buy`;
          html += `</span>`;
          html += `<span class="itemType">`;
            html += offer.itemType;
          html += `</span>`;
          html += `<span class="price">`;
            html += `+$` + offer.price.toFixed(2);
          html += `</span>`;
          html += `<span class="amount">`;
            html += `X` + offer.amount;
          html += `</span>`;
          html += `<span class="equals">`;
            html += ` = `;
          html += `<span>`;
          html += `<span class="singlePrice">`;
            html += `+$` + offer.singlePrice.toFixed(2) + " per single";
          html += `</span>`;
        html += `</div>`; // <./offer[offerType=buy]>
      }
    html += `</div>`; // <./offers>
  html += `</div>`; // <./deal>
  // append html to the target
  $(target).append(html);
}

function bindShops() {
  // POST/PUT: shops
  // when "complete shop" button is clicked, create or update a shop
  $(".shop [role=complete-shop]").click(function(event) {
    event.preventDefault();
    var $shop = $(this).parent();
    var $offers = $shop.find(".offer");
    // configure which request to send and which route to send it to
    var _id = $shop.attr("_id");
    var method;
    var url;
    if (_id == "new") {
      method = "POST";
      url = "/shops";
    } else {
      method = "PUT";
      url = "/shops/" + _id;
    }
    // extract data from the shop to send to the route
    var shop = {
      owner: "",
      offers: []
    };
    shop.owner = $shop.find("[name=owner]").val();
    for (var i = 0; i < $offers.length; i++) {
      var offer = {};
      var $offer = $($offers[i]);
      offer.offerType = $offer.find("[name=offerType]").val();
      offer.item = $offer.find("[name=item]").val();
      offer.itemType = $offer.find("[name=itemType]").val();
      offer.amount = Number($offer.find("[name=amount]").val());
      offer.price = Number($offer.find("[name=price]").val());
      shop.offers.push(offer);
    }
    // send request to the route
    $.ajax(url, {
      method: method,
      data: shop,
      success: function() {
        window.location.reload();
      }
    });
  });
  // Add offer to shop
  $(".shop [role=add-offer]").click(function(event) {
    event.preventDefault();
    $(this).parent().find(".offers").append(generateOfferHTML(emptyOfferJSON));
  });
  // Delete offers
  $("#remove-offer-start").click(function(event) {
    event.preventDefault();
    removeOfferMode = true;
    $("#overlay").show();
  });
  $("#remove-offer-cancel").click(function(event) {
    event.preventDefault();
    removeOfferMode = false;
    $("#overlay").hide();
  });
  $(".shop .offer").click(function() {
    if (removeOfferMode) {
      $(this).remove();
    }
  });
  $(".shop .offer").hover(function() {
    if (removeOfferMode) {
      $(".shop .offer").removeClass("highlighted");
      $(this).addClass("highlighted");
    }
  });
  // Delete shops
  $(".shop [role=remove-shop]").click(function(event) {
    event.preventDefault();
    var shopID = $(this).parent().attr("_id");
    $.ajax("/shops/" + shopID, {
      method: "delete",
      success: function() {
        window.location.reload();
      }
    })
  });
}

function displayShop(target, shop) {
  var html = ``;
  var tmp_id;
  if (shop._id) {
    tmp_id = shop._id;
  } else {
    tmp_id = "new";
  }
  html += `<div class="shop" shopType="` + shop.shopType + `" _id="` + tmp_id + `">`;
    html += `<div role="owner-container">`;
      html += `<input name="owner" type="text" placeholder="x_Penguin_x" `
      html += `value="` + shop.owner + `"`
      html += `>`;
    html += `</div>`
    html += `<table class="offers">`;
      html += `
      <thead>
        <tr>
          <td>type</td>
          <td>item</td>
          <td>itemType</td>
          <td>amount</td>
          <td>price</td>
        </tr>
      </thead>`;
      html += `<tbody>`;
        for (var i = 0; i < shop.offers.length; i++) {
          html += generateOfferHTML(shop.offers[i]);
        }
      html += `</tbody>`;
    html += `</table>`;
    html += `<br>`;
    html += `
    <a href='#' role="add-offer" class="btn btn-primary">
      Add Offer
    </a>
    `;
    html += `
    <a href='#' role="complete-shop" class="btn btn-success">
      Complete Shop
    </a>
    `;
    html += `
    <a href='#' role="remove-shop" class="btn btn-danger">
      Remove Shop
    </a>
    `;
  html += `</div>`;
  $(target).append(html);
}

function generateOfferHTML(offer) {
  // the html to return
  var html = ``;
  // make a table row
  html += `<tr class="offer">`;
    // types and select which type
    html += `<td class="detail">`;
      html += `<select name="offerType">`;
        for (var j = 0; j < offerDefaultJSON.types.length; j++) {
          html += `<option value="` + offerDefaultJSON.types[j] + `"`;
          if (offer.offerType == offerDefaultJSON.types[j]) {
            html += ` selected`;
          }
          html += `>` + formatValue(offerDefaultJSON.types[j]) + `</option>`;
        }
      html += `</select>`;
    html += `</td>`
    // item and select which item
    html += `<td class="detail">`;
      html += `<select name="item">`;
        for (var j = 0; j < offerDefaultJSON.items.length; j++) {
          html += `<option value="` + offerDefaultJSON.items[j] + `"`;
          if (offer.item == offerDefaultJSON.items[j]) {
            html += ` selected`;
          }
          html += `>` + formatValue(offerDefaultJSON.items[j]) + `</option>`;
        }
      html += `</select>`;
    html += `</td>`;
    // itemType and select which itemType
    html += `<td class="detail">`;
      html += `<select name="itemType">`;
        for (var j = 0; j < offerDefaultJSON.itemTypes.length; j++) {
          html += `<option value="` + offerDefaultJSON.itemTypes[j] + `"`;
          if (offer.itemType == offerDefaultJSON.itemTypes[j]) {
            html += ` selected`;
          }
          html += `>` + formatValue(offerDefaultJSON.itemTypes[j]) + `</option>`;
        }
      html += `</select>`;
    html += `</td>`;
    // amount and insert given amount
    html += `<td class="detail">`
      html += `<input name="amount" type="text" value="` + offer.amount + `">`;
    html += `</td>`
    // price and insert given price
    html += `<td class="detail">`;
      html += `<input name="price" type="text" value="` + offer.price + `">`;
    html += `</td>`;
  html += `</tr>`;
  // return html
  return html;
}

/**
  Helpers
*/
var offerDefaultJSON = {
  types: ["buy", "sell"],
  items: ["oak_wood", "dirt", "coarse_dirt", "grass_block", "cobblestone", "stone",
  "coal", "iron", "gold", "diamond", "lapis", "redstone", "gravel", "flint",
  "glowstone", "egg", "emerald"],
  itemTypes: ["single", "ore", "ingot", "block"]
};
function formatValue(str) {
  var tmpArr = str.split("_");
  for (var i = 0; i < tmpArr.length; i++) {
    tmpArr[i] = jsUcfirst(tmpArr[i]);
  }
  return tmpArr.join(" ");
}
// https://dzone.com/articles/how-to-capitalize-the-first-letter-of-a-string-in
function jsUcfirst(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}
