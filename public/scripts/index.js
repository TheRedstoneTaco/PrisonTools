var userID;
var user, contacts, encounters, events;

$(document).ready(function() {

  $(".nav-item").click(function() {
    $(".nav-item").removeClass("active");
    $(this).addClass("active");
  });

  // get user
  userID = $("#userID").text().trim();
  $("#userID").remove();
  $.ajax("/user/" + userID, {
    method: "GET",
    success: function(data) {
      user = data;
      contacts = user.contacts;
      encounters = user.encounters;
      events = user.events;
    }
  });

});
