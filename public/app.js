$(document).ready(function () {
  // Setting a reference to the article-container div where all the dynamic content will go
  // Adding event listeners to any dynamically generated "save articles"
  // and "scrape new article" buttons
  var articleContainer = $(".article-container");
  // $(document).on("click", ".btn.save", handleArticleSave);
  // $(document).on("click", ".scrape-new", handleArticleScrape);
  $(".clear").on("click", handleArticleClear);
  $(".clearNotes").on("click", handleNoteClear);
  $(".load").on("click", handleArticleLoad);
  $(".delete-article").on("click", handleArticleDelete);
  $(".delete-note").on("click", handleNoteDelete);


  function handleArticleClear() {
    $.get("clear").then(function() {
      articleContainer.empty();
      // initPage();
    });
  }

  function handleNoteClear() {
    $.get("clearNotes").then(function() {
      articleContainer.empty();
      initPage();
    });
  }

  function handleArticleLoad() {
    $.get("scrape").then(function() {
      articleContainer.empty();
    }).then(function() {
      initPage();
    });
  }

  function handleArticleDelete() {
    // console.log("handle article delete method being fired.");
    //figure out the id of the article to delete
    var thisId = $(this).attr("data-id");
    // console.log("New method; time to delete the article of id: " + thisId);
    $.get("deleteArticle/" + thisId).then(function() {
      articleContainer.empty();
    }).then(function() {
      initPage();
    });
  }

  function handleNoteDelete() {
    // console.log("handle note delete method being fired.");
    //figure out the id of the note to delete
    var thisId = $(this).attr("data-id");
    var articleId = $(this).attr("data-articleId");
    // console.log("New method; time to delete the note of id: " + thisId);
    $.get("deleteNote/" + thisId + "&" + articleId).then(function() {
      articleContainer.empty();
    }).then(function() {
      initPage();
    });
  }

});


initPage();

function initPage() {
  $.getJSON("/articles", function (data) {
    // For each one
    for (var i = 0; i < data.length; i++) {
      // Display the apropos information on the page
      $("#articles").append(
        "<div class='row article-row'>" +
          "<div class='col col-md-8'>" +
          "<p data-id='" + data[i]._id + "'>" + data[i].title + "<br />" + data[i].link + "</p>" +
          "</div>" +
          "<div class='col col-md-4 button-box'>" +
          "<a data-id='" + data[i]._id + "' " + "class='btn btn-warning btn-sm delete-article'>Delete Article</a>" +
          "<a class='btn btn-info btn-sm add-note'>Add Comment</a>" +
          "</div>" +
        "</div>"
      );
      for (var j=0; j<data[i].notes.length; j++) {
        $("#articles").append(
          "<div class='row note-row'>" +
            "<div class='col col-md-8'>" +
            "<p data-id='" + data[i].notes[j]._id + "'>" + data[i].notes[j].title + "<br />" + data[i].notes[j].body + "</p>" +
            "</div>" +
            "<div class='col col-md-4 button-box'>" +
            "<a data-id='" + data[i].notes[j]._id + "' data-articleId='" + data[i]._id + "' " + "class='btn btn-warning btn-sm delete-note'>Delete Note</a>" +
            "</div>" +
          "</div>"
        );
      }
    }
  });
}



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

      // // If there's a note in the article
      // if (data.note) {
      //   // Place the title of the note in the title input
      //   $("#titleinput").val(data.note.title);
      //   // Place the body of the note in the body textarea
      //   $("#bodyinput").val(data.note.body);
      // }
    });
});



// When you click the savenote button
$(document).on("click", "#savenote", function () {
  // Grab the id associated with the article from the submit button
  var thisId = $(this).attr("data-id");

  // Run a POST request to create the note, using what's entered in the inputs
  $.ajax({
    method: "POST",
    url: "/addNoteToArticle/" + thisId,
    data: {
      // Value taken from title input
      title: $("#titleinput").val(),
      // Value taken from note textarea
      body: $("#bodyinput").val(),
      article: thisId
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


