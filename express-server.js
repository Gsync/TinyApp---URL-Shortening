var express = require("express");
var app = express();
app.set("view engine", "ejs");

var PORT = process.env.PORT || 8080; //default port 8080

var urlDatabase = {
  "b2xVn2" : "www.lighthouselabs.ca",
  "9sm5sK" : "www.google.com"
}

app.get("/", (req, res) => {
  res.end("Hello! Khuram");
});

app.get("/urls", (req, res) => {
  let templateVars = {urls : urlDatabase};
  res.render("urls_index", templateVars);
});

app.get("/urls/:id", (req, res) => {
  let templateVars = {
    shortURL: req.params.id,
    url: urlDatabase
  };
  res.render("urls_show", templateVars);
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