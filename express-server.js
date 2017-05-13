var express = require("express");
var app = express();
app.set("view engine", "ejs");
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

var PORT = process.env.PORT || 8080; //default port 8080

var urlDatabase = {
  "b2xVn2" : "http://www.lighthouselabs.ca",
  "9sm5sK" : "http://www.google.com"
}

//Generate random string of 6 alpha numeric characters
function generateRandomString() {

  var url_id = "";
  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for (var i = 0; i < 6; i++) {
    url_id += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return url_id;
}

app.get("/", (req, res) => {
  res.end("Hello! Khuram");
});

//Render endpoint urls_index from /urls in the address bar
app.get("/urls", (req, res) => {
  let templateVars = {urls : urlDatabase};
  res.render("urls_index", templateVars);
});

//Add new URL
app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

//Get input from address bar to assign shortURL
app.get("/urls/:id", (req, res) => {
  let templateVars = {
    shortURL: req.params.id,
    url: urlDatabase
  };
  res.render("urls_show", templateVars);
});

//post URL
app.post("/urls", (req, res) => {
  console.log(req.body.longURL); //debug statement to see post parameters
  shortURL = generateRandomString(); //generate random string and assign to shortURL
  urlDatabase[shortURL] = req.body.longURL; //pass the shortURL and longURL to urlDatabase
      res.redirect(urlDatabase[shortURL]);
  //res.send("Ok");       //Respond with Ok (we will repalce this)
});

//Render the redirect to shortURL
app.get("/u/:shortURL", (req, res) => {

  let longURL = urlDatabase[req.params.shortURL];

  console.log(urlDatabase, req.params.shortURL)
  if (!longURL) {
      res.status(404).send('URL not found!');
    } else {
      res.redirect(303, longURL);
    }
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.end("<html><body>Hello! <b>World</b></body></html>")
});

app.listen(PORT, () => {
  console.log(`Example app listing to port ${PORT}!`);
});