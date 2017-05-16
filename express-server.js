const express = require("express");
const cookieParser = require('cookie-parser')
const app = express();
app.set("view engine", "ejs");
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser())

const PORT = process.env.PORT || 8080; //default port 8080

//URL Object to be used as a data store
const urlDatabase = {
  "b2xVn2" : {
              site: "http://www.lighthouselabs.ca",
              userID: "user2"
              },
  "9sm5sK" : {
              site: "http://www.google.com",
              userID: "user3"
              },
  "9sm5sV" : {
              site: "http://www.yahoo.com",
              userID: "user3"
              },
  "9sv5sK" : {
              site: "http://www.msn.com",
              userID: "user2"
              }
}

//Users Object to be used as a users database
const userDatabase = {
  "userRandomId": {
    id: "userRandomId",
    email: "user1@example.com",
    password: "654321",
  },

  "user2": {
    id: "user2",
    email: "user2@example.com",
    password: "123456"
  },

  "user3": {
    id: "user3",
    email: "user3@example.com",
    password: "1456"
  },
  "user4": {
    id: "user4",
    email: "user4@example.com",
    password: "12346"
  },
}

//Generate random string of 6 alpha numeric characters
function generateRandomString() {

  let url_id = "";
  let possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for (var i = 0; i < 6; i++) {
    url_id += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return url_id;
}

app.get("/", (req, res) => {
  res.end("Please check the url you need to acess!");
});

//Find URLs for User based on userid
function urlsForUser(id) {

  var userUrls = {};
  for (index in urlDatabase) {
    if (urlDatabase[index].userID === id ) {

      userUrls[index] = urlDatabase[index];

    }
  }
  return userUrls;
}


//Render endpoint urls_index
app.get("/urls", (req, res) => {

  let user_id = req.cookies["user_id"];
  var userUrls = urlsForUser(user_id);

  if (user_id) {

    urlsForUser(user_id);
    var templateVars = {
    urls : userUrls,
    user: userDatabase[user_id]
  };
    res.render("urls_index", templateVars);
  } else {
    res.render("urls_login");
  }
});

//Login Page Get Request
app.get("/login", (req, res) => {
  res.render("urls_login");
});

//Register a user
app.get("/register", (req, res) => {
  //pass the variables to regiter ejs template
  res.render("urls_register");
});

//Registeration handler Post
app.post("/register", (req, res) => {

  let userFound = false;

  for (var index in userDatabase) {
    //console.log(userDatabase[index].email);

    if (req.body.email === userDatabase[index].email) {
      userFound = true;
    }
  }
  if (!(req.body.email && req.body.password)) {
      res.status(400).send("Please enter a valid email or password!");

    } else if (userFound) {
      res.status(400).send("You are already registered with this email!");
      }

    else {
      let user_id = generateRandomString();
      userDatabase[user_id] = {
        id: user_id,
        email:  req.body.email,
        password:  req.body.password
      }
      res.cookie('user_id', user_id);
      //console.log(userDatabase)
      res.redirect("/urls");
    }
});

//Get new URL
app.get("/urls/new", (req, res) => {
  let user_id = req.cookies["user_id"];
  let templateVars = {
    urls : urlDatabase,
    user: userDatabase[user_id]
  };
if (user_id) {
  res.render("urls_new", templateVars);
} else {
  res.render("urls_login");
}
});

//Get input from address bar to assign shortURL
app.get("/urls/:id", (req, res) => {

  if (urlDatabase[req.params.id].userID === req.cookies["user_id"]) {

    let templateVars = {
        shortURL: req.params.id,
        url: urlDatabase,
        user: userDatabase[req.cookies["user_id"]]
    };

    res.render("urls_show", templateVars);

  } else {

    res.status(403).send("You do not have rights to edit this URL!");
  }
});

//Add a new URL post
app.post("/urls", (req, res) => {
  //console.log(req.body.longURL); //debug statement to see post parameters
  let shortURL = generateRandomString(); //generate random string and assign to shortURL
  urlDatabase[shortURL] = {site: req.body.longURL}; //pass the shortURL and longURL to urlDatabase
      res.redirect("/urls");
});

//Render the redirect to shortURL
app.get("/u/:shortURL", (req, res) => {

  let longURL = urlDatabase[req.params.shortURL].site;

  //console.log(urlDatabase, req.params.shortURL)
  if (!longURL) {
      res.status(404).send('URL not found!');
    } else {
      res.redirect(longURL);
    }
});

//login Route
app.post("/login", (req, res) => {

  let userFound = false;

  for (var index in userDatabase) {
    //console.log(userDatabase[index].email);

    if (req.body.email === userDatabase[index].email && req.body.password === userDatabase[index].password) {
      userFound = true;
      var user_id = userDatabase[index].id;
    }
  }
  if (!(req.body.email && req.body.password)) {
      res.status(403).send("Please enter a valid email or password!");

  } else if (userFound) {
      userDatabase[user_id] = {
        id: user_id,
        email:  req.body.email,
        password:  req.body.password
      }
      res.cookie('user_id', user_id);
      //console.log(userDatabase)
      res.redirect("/urls");}

    else {
      res.status(403).send("Please enter the correct email and password!");

    }
});

//logout Route
app.post("/logout", (req, res) => {
  res.clearCookie('user_id');//clear cookies
  res.redirect("/urls");
});

//Delete a URL post
app.post("/urls/:id/delete", (req, res) => {

  if (urlDatabase[req.params.id].userID === req.cookies["user_id"]) {

    delete urlDatabase[req.params.id];//delete url index

  } else {

    res.status(403).send("You do not have rights to edit this URL!");
  }

  res.redirect("/urls"); //redirect to urls index page
});

//Update a URL post
app.post("/urls/:id", (req, res) => {

  urlDatabase[req.params.id].site = req.body.longURL;
  res.redirect("/urls"); //redirect to urls index page
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});


app.listen(PORT, () => {
  console.log(`Example app listing to port ${PORT}!`);
});