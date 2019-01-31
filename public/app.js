$(document).ready(function () {
  // Setting a reference to the article-container div where all the dynamic content will go
  // Adding event listeners to any dynamically generated "save articles"
  // and "scrape new article" buttons
  var articleContainer = $(".article-container");
  // $(document).on("click", ".btn.save", handleArticleSave);
  // $(document).on("click", ".scrape-new", handleArticleScrape);
  $(".clear").on("click", handleArticleClear);
  $(".load").on("click", handleArticleLoad);

  // function initPage() {
  //   // Run an AJAX request for any unsaved headlines
  //   $.get("/api/headlines?saved=false").then(function(data) {
  //     articleContainer.empty();
  //     // If we have headlines, render them to the page
  //     if (data && data.length) {
  //       renderArticles(data);
  //     } else {
  //       // Otherwise render a message explaining we have no articles
  //       renderEmpty();
  //     }
  //   });
  // }

  function handleArticleClear() {
    $.get("clear").then(function() {
      articleContainer.empty();
      // initPage();
    });
  }

  function handleArticleLoad() {
    $.get("scrape").then(function() {
      articleContainer.empty();
      initPage();
    });
  }

  function initPage() {
    $.getJSON("/articles", function (data) {
      // For each one
      for (var i = 0; i < data.length; i++) {
        // Display the apropos information on the page
        $("#articles").append("<p data-id='" + data[i]._id + "'>" + data[i].title + "<br />" + data[i].link + "</p>");
      }
    });
  }

});

// Grab the articles as a json
$.getJSON("/articles", function (data) {
  // For each one
  for (var i = 0; i < data.length; i++) {
    // Display the apropos information on the page
    $("#articles").append("<p data-id='" + data[i]._id + "'>" + data[i].title + "<br />" + data[i].link + "</p>");
  }
});




// Whenever someone clicks a p tag
$(document).on("click", "p", function () {
  // Empty the notes from the note section
  console.log("p tage clicked.");
  $("#notes").empty();
  // Save the id from the p tag
  var thisId = $(this).attr("data-id");

  // Now make an ajax call for the Article
  $.ajax({
    method: "GET",
    url: "/articles/" + thisId
  })
    // With that done, add the note information to the page
    .then(function (data) {
      console.log(data);
      // The title of the article
      $("#notes").append("<h2>" + data.title + "</h2>");
      // An input to enter a new title
      $("#notes").append("<input id='titleinput' name='title' >");
      // A textarea to add a new note body
      $("#notes").append("<textarea id='bodyinput' name='body'></textarea>");
      // A button to submit a new note, with the id of the article saved to it
      $("#notes").append("<button data-id='" + data._id + "' id='savenote'>Save Note</button>");

      // If there's a note in the article
      if (data.note) {
        // Place the title of the note in the title input
        $("#titleinput").val(data.note.title);
        // Place the body of the note in the body textarea
        $("#bodyinput").val(data.note.body);
      }
    });
});



// When you click the savenote button
$(document).on("click", "#savenote", function () {
  // Grab the id associated with the article from the submit button
  var thisId = $(this).attr("data-id");

  // Run a POST request to change the note, using what's entered in the inputs
  $.ajax({
    method: "POST",
    url: "/articles/" + thisId,
    data: {
      // Value taken from title input
      title: $("#titleinput").val(),
      // Value taken from note textarea
      body: $("#bodyinput").val()
    }
  })
    // With that done
    .then(function (data) {
      // Log the response
      console.log(data);
      // Empty the notes section
      $("#notes").empty();
    });

  // Also, remove the values entered in the input and textarea for note entry
  $("#titleinput").val("");
  $("#bodyinput").val("");
});


