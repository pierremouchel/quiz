var express = require('express');
var bodyParser = require("body-parser");
var validator = require('validator');
const Entities = require('html-entities').AllHtmlEntities;
var mysql = require('mysql');
const crypto = require('crypto');
var datetime = require('node-datetime');
var fs = require ('fs');

var connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : '',
  database : 'broquiz'
});

connection.connect(function(err){});
const entities = new Entities();

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
var signup_error;
var signin_error;
var error_type = 0;

app.use(express.static(__dirname+'/'))
.use(bodyParser.urlencoded({ extended: true }))

.get('/', function(request, response) {
  eval(fs.readFileSync('scripts/default.js').toString());

})

.post('/signin', function(request, response) {
  eval(fs.readFileSync('scripts/signin.js').toString());
})

.post('/signup', function(request, response) {
  eval(fs.readFileSync('scripts/signup.js').toString());
})

.get('/accueil', function(request, response){
  eval(fs.readFileSync('scripts/accueil.js').toString());
})

.listen(8080);
