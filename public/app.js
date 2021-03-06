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
  $(".add-note").on("click", handleAddNote);

});

var articleContainer = $(".article-container");
initPage();

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
  // alert("you clicked the delete button.");
  // console.log("handle article delete method being fired.");
  //figure out the id of the article to delete
  var thisId = $(this).attr("data-id");
  // console.log("New method; time to delete the article of id: " + thisId);
  $.get("deleteArticle/" + thisId).then(function() {
    articleContainer.empty();
  }).then(function() {
    initPage();
  }).then(function() {
    location.reload(true);
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

function emptyArticles () {
  var articleContainer = $(".article-container");
  articleContainer.empty();
}

function initPage() {
  $.getJSON("/articles", function (data) {
    // alert("the page should now reload...");
    // For each one
    for (var i = 0; i < data.length; i++) {
      // Display the apropos information on the page
      $("#articles").append(
        "<div class='row article-row " + data[i]._id + "'>" +
          "<div class='col col-sm-9'>" +
            "<p data-id='" + data[i]._id + "'>" + data[i].title + "<br />" +
            "<a href='" + data[i].link + "'>" + data[i].link + "</p>" +
          "</div>" +
          "<div class='col col-sm-3 button-box'>" +
          "<a data-id='" + data[i]._id + "' " + "class='btn btn-warning btn-sm delete-article'>Delete Article</a>" +
          "<a data-id='" + data[i]._id + "' " + "class='btn btn-info btn-sm add-note'>Add Comment</a>" +
          "</div>" +
        "</div>"
      );
      for (var j=0; j<data[i].notes.length; j++) {
        $("#articles").append(
          "<div class='row note-row'>" +
            "<div class='col col-sm-9'>" +
            "<p data-id='" + data[i].notes[j]._id + "'>" + data[i].notes[j].title + "<br />" + data[i].notes[j].body + "</p>" +
            "</div>" +
            "<div class='col col-sm-3 button-box'>" +
            "<a data-id='" + data[i].notes[j]._id + "' data-articleId='" + data[i]._id + "' " + "class='btn btn-warning btn-sm delete-note'>Delete Note</a>" +
            "</div>" +
          "</div>"
        );
      }
    }
    $(".delete-article").on("click", handleArticleDelete);
    $(".delete-note").on("click", handleNoteDelete);
    $(".add-note").on("click", handleAddNote);
  });
}



// Whenever someone clicks add comment button
function handleAddNote() {
  // Save the id from the add comment button
  var thisId = $(this).attr("data-id");
  
  // Now make an ajax call for the Article
  $.ajax({
    method: "GET",
    url: "/articles/" + thisId
  })
    // With that done, add the note information to the page
    .then(function (data) {
      console.log(data);
      console.log(thisId);
      $("." + thisId).after("<div class='row noteAddition-row'>" +
        "<div class='col col-sm-3'>" +
          "<p>Comment Heading</p><input id='titleinput' name='title' >" +
        "</div>" +
        "<div class='col col-sm-6'>" +
          "<textarea id='bodyinput' name='body' placeholder='Comments go here...'></textarea>" +
        "</div>" +
        "<div class='col col-sm-3 button-box'>" +
          // "class='btn btn-warning btn-sm delete-note'>" +
          "<button data-id='" + data._id + "' id='savenote' class='btn btn-warning btn-sm'>Save Note</button>" +
        "</div>" +
      "</div>");
      // // The title of the article
      // $("#notes").append("<h2>" + data.title + "</h2>");
      // // An input to enter a new title
      // $("#notes").append("<input id='titleinput' name='title' >");
      // // A textarea to add a new note body
      // $("#notes").append("<textarea id='bodyinput' name='body'></textarea>");
      // // A button to submit a new note, with the id of the article saved to it
      // $("#notes").append("<button data-id='" + data._id + "' id='savenote'>Save Note</button>");

    });
};



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
      emptyArticles();
      initPage();
    });

  // Also, remove the values entered in the input and textarea for note entry
  $("#titleinput").val("");
  $("#bodyinput").val("");
});


