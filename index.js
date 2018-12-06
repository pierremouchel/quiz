var express = require('express');
var app = require('express')();
var bodyParser = require("body-parser");
var validator = require('validator');
const Entities = require('html-entities').AllHtmlEntities;
var mysql = require('mysql');
const crypto = require('crypto');
var datetime = require('node-datetime');
var fs = require ('fs');
var server  = require("http").createServer(app);
var io = require("socket.io")(server);

var session = require("express-session")({
    secret: "lorenzovonmatterhorn",
    resave: true,
    saveUninitialized: true
  }),
  sharedsession = require("express-socket.io-session");

app.use(session);

io.use(sharedsession(session, {
    autoSave:true
}));

server.listen(8080);

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

var signup_error;
var signin_error;
var error_type = 0;

app.use(express.static(__dirname+'/'))
.use(bodyParser.urlencoded({ extended: true }))

.get('/', function(request, response) {
  eval(fs.readFileSync('scripts/default.js').toString());
})

.get('/accueil', function(request, response){
  eval(fs.readFileSync('scripts/accueil.js').toString());
})

.post('/addfriend', function(request, response){
  eval(fs.readFileSync('scripts/add_friend.js').toString());
});

io.on('connection', function (socket) {
  socket.on('signin', function (login, password) {
    eval(fs.readFileSync('scripts/signin.js').toString());
  });
  socket.on('signup', function (login, password, confpassword, email, confemail, country) {
    eval(fs.readFileSync('scripts/signup.js').toString());
  });
});
