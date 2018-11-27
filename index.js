var express = require('express');
var bodyParser = require("body-parser");
var validator = require('validator');

var app = express();

app.use(express.static(__dirname+'/'));
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', function(request, response) {
    response.render('index.ejs',{error:0});
});

app.listen(8080);

app.post('/signin.html', function(request, response) {
  var login = request.body.connectLogin;
  var password = request.body.connectPassword;
  console.log(login + " " + password);
});

app.post('/signup.html', function(request, response) {
  var login = request.body.login;
  var password = request.body.password;
  var confpassword = request.body.confpassword;
  var email = request.body.email;
  var confemail = request.body.confemail;
  var country = request.body.country;

  if(validator.isEmpty(login) || validator.isEmpty(password) || validator.isEmpty(confpassword) || validator.isEmpty(email) || validator.isEmpty(confemail) || validator.isEmpty(country)){
    response.redirect('/?error=' + 1);
  }
  console.log(login + " " + password + " " + confpassword + " " + email + " " + confemail + " " + country);
});
