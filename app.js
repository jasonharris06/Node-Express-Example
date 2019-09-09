const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const session = require("express-session");
const flash = require("connect-flash");
const config = require("./config/database")
const passport = require("passport")

mongoose.connect(config.database, { useNewUrlParser: true });
var db = mongoose.connection;

//check connection
db.once("open", function () {
  console.log("connected to the mongoDB");
});
//Check for DB errors
db.on("error", function (err) {
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

//passport config
require("./config/passport")(passport);

//Passport Middleware
app.use(passport.initialize());
app.use(passport.session());

//Express Messages Middleware
app.use(require("connect-flash")());

app.use(function (req, res, next) {
  res.locals.messages = require("express-messages")(req, res);
  next();
});

app.get("*", function (req, res, next) {
  res.locals.user = req.user || null;
  next();
})
//Home route
app.get("/", function (req, res) {
  Article.find({}, function (err, articles) {
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



//Rourter Files
let articles = require("./routes/articles.js");
let users = require("./routes/users")
app.use("/articles", articles);
app.use("/users", users);

// Start Server
app.listen(3000, function () {
  console.log("Server started on port 3000..");
});
