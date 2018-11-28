var express = require('express');
var bodyParser = require("body-parser");
var validator = require('validator');
const Entities = require('html-entities').AllHtmlEntities;
var mysql      = require('mysql');
const crypto = require('crypto');

var connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : '',
  database : 'broquiz'
});

const entities = new Entities();

function validateSignup(login,password,confpassword,email,confemail,country) {
  console.log(email,confemail);
  if(validator.isEmpty(login) || validator.isEmpty(password) || validator.isEmpty(confpassword) || validator.isEmpty(email) || validator.isEmpty(confemail) || validator.isEmpty(country)){
    error = 'Tout les champs ne sont pas complets !';
  } else if (/\s/.test(login)) {
    error = 'Votre pseudo ne doit pas contenir d\'espace !';
  } else if (entities.encode(login) != login) {
    error = 'Votre pseudo n\'est pas valide !';
  } else if (login.length < 5) {
    error = 'Votre pseudo doit contenir 5 caractères minimum !';
  } else if (password.length < 5) {
    error = 'Votre mot de passe doit contenir 5 caractères minimum !';
  } else if (password != confpassword) {
    error = 'Les mots de passe ne correspondent pas !';
  } else if (validator.isEmail(email) == false) {
    error = 'Votre email est invalide !';
  } else if (email != confemail) {
    error = 'Les email ne correspondent pas !';
  } else {
    error = 'none';
  }
}
function hashPwd(password) {
  var genRandomString = function(length){
    return crypto.randomBytes(Math.ceil(length/2))
            .toString('hex') /** convert to hexadecimal format */
            .slice(0,length);   /** return required number of characters */
  };

  var sha512 = function(password, salt){
    var hash = crypto.createHmac('sha512', salt); /** Hashing algorithm sha512 */
    hash.update(password);
    var value = hash.digest('hex');
    return {
        salt:salt,
        passwordHash:value
    };
  };

  salt = genRandomString(16); /** Gives us salt of length 16 */
  passwordData = sha512(password, salt);
}
function getDate() {
  today = new Date();
  var dd = today.getDate();
  var mm = today.getMonth()+1; //January is 0!
  var yyyy = today.getFullYear();

  if(dd<10) {
      dd = '0'+dd
  }

  if(mm<10) {
      mm = '0'+mm
  }

  today = yyyy + '-' + mm + '-' + dd + ' 00:00:00';
}

var app = express();

app.use(express.static(__dirname+'/'));
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', function(request, response) {
  if (typeof error == 'undefined') {
    response.render('index.ejs');
  } else {
    response.render('index.ejs',{error:error,login:login,password:password,confpassword:confpassword,email:email,confemail:confemail,country:country});
  }

});

app.post('/signin.html', function(request, response) {
  login = request.body.connectLogin;
  password = request.body.connectPassword;
});

app.post('/signup.html', function(request, response) {
  login = request.body.login.trim();
  password = request.body.password.trim();
  confpassword = request.body.confpassword.trim();
  email = request.body.email.trim();
  confemail = request.body.confemail.trim();
  country = request.body.country.trim();

  validateSignup(login,password,confpassword,email,confemail,country);

  if (error != 'none') {
    response.redirect('/');
  } else {
    login = entities.encode(login);
    hashPwd(password);
    if (country.indexOf('(') != -1) {
      country = (country.slice(0,country.indexOf('(')));
    }
    getDate();
    console.log(today);
    response.redirect('/');
  }

});

app.listen(8080);
