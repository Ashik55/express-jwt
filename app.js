const express = require("express");

const bodyParser = require("body-parser");
let jwt = require("jsonwebtoken");
const config = require("./middlewares/config.json"); // refresh
let tokenChecker = require("./middlewares/tokenChecker");
let app = express(); // Export app for other routes to use

const port = process.env.PORT || 8000;

// Store all refresh token against user details
const tokenList = {};

app.use(
  bodyParser.urlencoded({
    // Middleware
    extended: true,
  })
);
app.use(bodyParser.json());
// Routes & Handlers




app.get("/secure", tokenChecker.checkToken, (req, res) => {
    res.json({
      success: true,
      message: "SecureSite login Successs",
    });
  });

app.get("/test", tokenChecker.checkToken, (req, res) => {
  res.json({
    success: true,
    message: "Running secure siteeee Successs",
  });
});



//First Step To generate AccessToken & RefreshToken
app.post('/signup', (req,res) => {
  const postData = req.body;
  const user = {
    email: postData.email,
    name: postData.name,
  };

  // do the database authentication here, with user name and password combination.
  const accessToken = jwt.sign(user, config.secret, {
    expiresIn: config.tokenLife,
  });
  const refreshToken = jwt.sign(user, config.refreshTokenSecret, {
    expiresIn: config.refreshTokenLife,
  });
  const response = {
    status: "Logged in",
    accessToken: accessToken,
    refreshToken: refreshToken,
  };
  tokenList[refreshToken] = response;
  res.status(200).json(response);
});


//Get New Access Token When Previous AccessToken is not validate any more
app.post('/get_accessToken', (req,res) => {
  // refresh the damn token
  const postData = req.body
  // if refresh token exists
  if((postData.refreshToken) && (postData.refreshToken in tokenList)) {
      const user = {
          "email": postData.email,
          "name": postData.name
      }
      const accessToken = jwt.sign(user, config.secret, { expiresIn: config.tokenLife})
      const response = {
          "accessToken": accessToken,
      }
      // update the token in the list
      tokenList[postData.refreshToken].accessToken = accessToken
      res.status(200).json(response);        
  } else {
      res.status(404).send('refresh token is not valid anymore')
  }
});




app.listen(port, () => console.log(`Server is listening on port: ${port}`));





