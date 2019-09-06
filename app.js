const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const session = require("express-session");
//const expressValidator = require("express-validator");
const flash = require("connect-flash");

mongoose.connect("mongodb://localhost/nodekb", { useNewUrlParser: true });
var db = mongoose.connection;

//check connection
db.once("open", function() {
  console.log("connected to the mongoDB");
});
//Check for DB errors
db.on("error", function(err) {
  console.log(err);
});

//init app
const app = express();

//Bring in Models
let Article = require("./models/article");

// Load View Engine
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");

// body parser Middleware
app.use(bodyParser.urlencoded({ extended: false }));

//pare application/json
app.use(bodyParser.json());

//Set Public Folder
app.use(express.static(path.join(__dirname, "public")));

//Express Session Middleware
app.use(
  session({
    secret: "keyboard cat",
    resave: true,
    saveUninitialized: true
  })
);

// // Express Validator Middleware
// app.use(
//   expressValidator({
//     errorFormatter: function(param, msg, value) {
//       var namespace = param.split("."),
//         root = namespace.shift(),
//         formParam = root;

//       while (namespace.length) {
//         formParam += "[" + namespace.shift() + "]";
//       }
//       return {
//         param: formParam,
//         msg: msg,
//         value: value
//       };
//     }
//   })
// );

//Express Messages Middleware
app.use(require("connect-flash")());
app.use(function(req, res, next) {
  res.locals.messages = require("express-messages")(req, res);
  next();
});

//Home route
app.get("/", function(req, res) {
  Article.find({}, function(err, articles) {
    if (err) {
      console.log(err);
    } else {
      res.render("index", {
        title: "Articles",
        articles: articles
      });
    }
  });
});

app.get("/articles/add", function(req, res) {
  res.render("add_article", {
    title: "add article"
  });
});

//Get single article
app.get("/article/:id", function(req, res) {
  Article.findById(req.params.id, function(err, article) {
    res.render("article", {
      article: article
    });
  });
});

//Add Submit POST Route
app.post("/articles/add", function(req, res) {
  let article = new Article();
  article.title = req.body.title;
  article.author = req.body.author;
  article.body = req.body.body;

  article.save(function(err) {
    if (err) {
      console.log(err);
      return;
    } else {
      req.flash("success", "Article Added");
      res.redirect("/");
    }
  });
});

//load Edit Form
app.get("/article/edit/:id", function(req, res) {
  Article.findById(req.params.id, function(err, article) {
    res.render("edit_article", {
      title: "Edit Article",
      article: article
    });
  });
});

//Update Submit POST Route
app.post("/articles/edit/:id", function(req, res) {
  let article = {};
  article.title = req.body.title;
  article.author = req.body.author;
  article.body = req.body.body;

  let query = { _id: req.params.id };
  Article.update(query, article, function(err) {
    if (err) {
      console.log(err);
      return;
    } else {
      req.flash("success", "Article Updated");
      res.redirect("/");
    }
  });
});

app.delete("/article/:id", function(req, res) {
  let query = { _id: req.params.id };

  Article.remove(query, function(err) {
    if (err) {
      console.log(err);
    }
    res.send("Success");
  });
});

// Start Server
app.listen(3000, function() {
  console.log("Server started on port 3000..");
});
