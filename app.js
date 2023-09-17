const express = require("express");
const bodyParser = require("body-parser");
const db = require("./db");
const session = require('express-session');
const SQLiteStore = require('connect-sqlite3')(session);
const bcrypt = require('bcrypt');

const ejs = require("ejs");
const { redirect } = require("express/lib/response");
const app = express();
const saltRounds = 10;
let y=[]


app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));
app.use(
  session({
    store: new SQLiteStore({
      db: 'secrets.sqlite', // Specify the SQLite database file
    }),
    secret: 'your-secret-key', // Change this to a strong secret
    resave: true,
    saveUninitialized: true,
  })
);

app.get("/",function(req,res){
    res.render("home");
})
app.get("/login",function(req,res){
    res.render("login");
})
app.get("/register",function(req,res){
    res.render("register");
})
app.get("/secrets",function(req,res){

    res.render("secrets",{posh:y});
})


app.post("/register", function (req, res) {
  const username = req.body.username;
  const password = req.body.password;

  // Hash the password using bcrypt
  bcrypt.hash(password, saltRounds, (err, hash) => {
    if (err) {
      console.error(err);
      return res.status(500).send("Internal Server Error");
    }

    // Store the hashed password in the database
    db.run(
      "INSERT INTO posts (email, password) VALUES (?, ?)",
      [username, hash], // Store the hashed password
      (err) => {
        if (err) {
          console.error(err);
          return res.status(500).send("Internal Server Error");
        }
        
        res.redirect("/submit");
      }
    );
  });
});

app.post("/login", function (req, res) {
  const username = req.body.username;
  const password = req.body.password;

  db.get('SELECT * FROM posts WHERE email = ?', [username], (err, row) => {
    if (err) {
      console.error(err.message);
      return res.status(500).send('Internal server error');
    }

    if (row) {
      // Compare the entered password with the stored hash
      bcrypt.compare(password, row.password, (err, result) => {
        if (err) {
          console.error(err.message);
          return res.status(500).send('Internal server error');
        }

        if (result) {
          // Passwords match, store user information in the session
          req.session.posts = row;
          

          // Redirect to a page or render a template for logged-in users
          res.redirect('/secrets'); // Example: Redirect to a secrets page
        } else {
          res.send('Login failed. Please try again.'); // Handle login failure
        }
      });
    }
  });
});
app.get("/submit",function(req,res){
  res.render("submit");
})
app.post("/submit", function(req, res) {
  const secret = req.body.secret;
 console.log(secret);
 y.push(secret);
 res.redirect("secrets")


});

app.get("/logout",function(req,res){
  res.render("home.ejs");
})


app.listen(3005, function() {
    console.log("Server started on port 3005");
  });
  



