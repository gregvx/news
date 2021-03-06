var express = require("express");
var logger = require("morgan");
var mongoose = require("mongoose");

// Our scraping tools
// Axios is a promised-based http library, similar to jQuery's Ajax method
// It works on the client and on the server
var axios = require("axios");
var cheerio = require("cheerio");

// Require all models
var db = require("./models");

var PORT = 3000;

// Initialize Express
var app = express();

// Configure middleware

// Use morgan logger for logging requests
app.use(logger("dev"));
// Parse request body as JSON
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
// Make public a static folder
app.use(express.static("public"));



// Connect to the Mongo DB
var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/mongoHeadlines";
mongoose.connect(MONGODB_URI);
// mongoose.connect("mongodb://localhost/unit18Populater", { useNewUrlParser: true });

// Routes

// A GET route for scraping the echoJS website
app.get("/scrape", function (req, res) {
  // First, we grab the body of the html with axios
  axios.get("http://www.echojs.com/").then(function (response) {
    // Then, we load that into cheerio and save it to $ for a shorthand selector
    var $ = cheerio.load(response.data);

    // Now, we grab every h2 within an article tag, and do the following:
    $("article h2").each(function (i, element) {
      // Save an empty result object
      var result = {};

      // Add the text and href of every link, and save them as properties of the result object
      result.title = $(this)
        .children("a")
        .text();
      result.link = $(this)
        .children("a")
        .attr("href");

      //before adding the article to the db, need to check and make sure it is not already in it
      db.Article.findOne({ link: result.link })
        .then(function (dbArticle) {
          // If we were able to successfully find an Article with the given link, note that it is present
          if (dbArticle === null) {
            // Create a new Article using the `result` object built from scraping
            db.Article.create(result)
              .then(function (dbArticle) {
                // View the added result in the console
                console.log(dbArticle);
              })
              .catch(function (err) {
                // If an error occurred, log it
                console.log(err);
              });
          }
        })
        .catch(function (err) {
          // If an error occurred, send it to the client
          res.json(err);
        });
    });
    // Send a message to the client
    res.send("Scrape Complete");
  });
});

// Route for getting all Articles from the db
app.get("/articles", function (req, res) {
  // Grab every document in the Articles collection
  db.Article.find({})
    .populate('notes')
    .then(function (dbArticles) {
      // If we were able to successfully find Articles, send them back to the client
      res.json(dbArticles);

    })
    .catch(function (err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});


// Route for grabbing a specific Article by id, populate it with it's note
app.get("/articles/:id", function (req, res) {
  // Using the id passed in the id parameter, prepare a query that finds the matching one in our db...
  db.Article.findOne({ _id: req.params.id })
    // ..and populate all of the notes associated with it
    // .populate("notes")
    .then(function (dbArticle) {
      // If we were able to successfully find an Article with the given id, send it back to the client
      res.json(dbArticle);
    })
    .catch(function (err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});

// Route for saving/updating an Article's associated Note
app.post("/addNoteToArticle/:id", function (req, res) {
  // Create a new note and pass the req.body to the entry
  db.Note.create(req.body)
    .then( function (dbNote) {
      //look up article and append to notes
      console.log("Note created, now, we need to attach it to article of id " + req.params.id);
      db.Article.findOneAndUpdate({_id: req.params.id}, {$push: {notes: dbNote}})
      // .then(function(dbArticle){dbArticle.notes.push(dbNote._id)})
      .catch(function(err) {
        res.json(err);
      });
      res.json(dbNote);
    })
    // .then(function (dbNote) {
    //   // If a Note was created successfully, find one Article with an `_id` equal to `req.params.id`. Update the Article to be associated with the new Note
    //   // { new: true } tells the query that we want it to return the updated User -- it returns the original by default
    //   // Since our mongoose query returns a promise, we can chain another `.then` which receives the result of the query
    //   return db.Article.findOneAndUpdate({ _id: req.params.id }, { note: dbNote._id }, { new: true });
    // })
    // .then(function (dbArticle) {
    //   // If we were able to successfully update an Article, send it back to the client
    //   res.json(dbArticle);
    // })
    .catch(function (err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});

// Route for deleting all Articles from the db
app.get("/clear", function (req, res) {
  // Delete every document in the Articles collection
  console.log("Time to delete all the articles from the db.");
  db.Article.deleteMany({}).then().catch();
  // Delete every document in the Notes collection as well
  console.log("Time to delete all the notes from the db as well.");
  db.Note.deleteMany({}).then().catch();
  // Send a message to the client
  res.send("Clear Complete");
});

// Route for deleting all Notes from the db
app.get("/clearNotes", function (req, res) {
  // Delete every document in the Notes collection
  console.log("Time to delete all the notes from the db.");
  db.Note.deleteMany({}).then().catch();
  // Send a message to the client
  res.send("Clear Complete");
});

// Route for deleting one Article from the db
app.get("/deleteArticle/:id", function (req, res) {
  // Delete the Article collection
  console.log("Time to delete the rticle of id:" + req.params.id);
  db.Article.deleteOne({_id: req.params.id}).then().catch();
  // Send a message to the client
  res.send("Clear Complete");
});

// Route for deleting one Note from the db
app.get("/deleteNote/:id&:articleId", function (req, res) {
  var noteId = req.params.id;
  var articleId = req.params.articleId;
  console.log("Time to delete the note of id:" + req.params.id + "and modifiy the record of article with id: " + req.params.articleId);
  db.Note.deleteOne({_id: req.params.id})
  .then(function(){
    db.Article.findOneAndUpdate({_id: articleId}, {$pull: {notes: noteId}})
    .catch(function(err) {
      res.json(err);
    });
  })
  .catch(function(err){
    res.json(err);
  });
  // Send a message to the client
  res.send("Clear Complete");
});

// Start the server
app.listen(process.env.PORT || PORT, function () {
  console.log("App running on port unknown but maybe:" + PORT + "!");
});
