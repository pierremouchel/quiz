var express = require('express');
var bodyParser = require("body-parser");
var validator = require('validator');
const Entities = require('html-entities').AllHtmlEntities;

const entities = new Entities();

//console.log(entities.encode('<>"&©®∆'));

function validateSignup(login,password,confpassword,email,confemail,country) {
  if(validator.isEmpty(login) || validator.isEmpty(password) || validator.isEmpty(confpassword) || validator.isEmpty(email) || validator.isEmpty(confemail) || validator.isEmpty(country)){
    error = 'Tout les champs ne sont pas complets !';
  } else if (/\s/.test(login)) {
    error = 'Votre pseudo ne doit pas contenir d\'espace !';
  } else if (login.length < 5) {
    error = 'Votre pseudo doit contenir 5 caractères minimum !';
  }
}

var app = express();

app.use(express.static(__dirname+'/'));
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', function(request, response) {
  response.render('index.ejs',{error:''});
});

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

  validateSignup(login,password,confpassword,email,confemail,country);
  response.render('index.ejs',{error:error});

  console.log(login + " " + password + " " + confpassword + " " + email + " " + confemail + " " + country);
});

app.listen(8080);
