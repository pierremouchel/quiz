var express = require('express');
var bodyParser = require("body-parser");
var validator = require('validator');
const Entities = require('html-entities').AllHtmlEntities;
var mysql = require('mysql');
const crypto = require('crypto');
var datetime = require('node-datetime');

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

app.use(express.static(__dirname+'/'));
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', function(request, response) {
  if (error_type == 0) {
    response.render('index.ejs',{error_type:error_type});
  } else if (error_type == 1) {
    response.render('index.ejs',{signin_error:signin_error,error_type:error_type,signin_login:signin_login,signin_password:signin_password});
  } else if (error_type == 2) {
    response.render('index.ejs',{signup_error:signup_error,error_type:error_type,login:login,password:password,confpassword:confpassword,email:email,confemail:confemail,country:country});
  }

});

app.post('/signin.html', function(request, response) {
  signin_login = request.body.connectLogin.trim();
  signin_password = request.body.connectPassword.trim();

  var sha512 = function(password, salt){
    var hash = crypto.createHmac('sha512', salt); /** Hashing algorithm sha512 */
    hash.update(password);
    var value = hash.digest('hex');
    return {
        passwordHash:value
    };
  };

  var validationSignin = new Promise((success,error) => {
    if(validator.isEmpty(signin_login) || validator.isEmpty(signin_password)){
      error('Tout les champs ne sont pas complets !');
    } else if (validator.isEmpty(signin_login) == false && validator.isEmail(signin_login)) {
      connection.query("SELECT user_email, user_password, user_salt FROM broquiz_user WHERE user_email = '"+signin_login+"'", function (err, result, fields) {
        if (result[0] == undefined) {
          error('Cet email n\'existe pas !');
        } else {
          if (sha512(signin_password, result[0].user_salt).passwordHash == result[0].user_password) {
            success('Connected');
          } else {
            error('Mot de passe éronné !')
          }
        }
      });
    } else if (validator.isEmpty(signin_login) == false) {
      connection.query("SELECT user_login, user_password, user_salt FROM broquiz_user WHERE user_login = '"+signin_login+"'", function (err, result, fields) {
        if (result[0] == undefined) {
          error('Ce login n\'existe pas !');
        } else {
          if (sha512(signin_password, result[0].user_salt).passwordHash == result[0].user_password) {
            success('Connected');
          } else {
            error('Mot de passe éronné !')
          }
        }
      });
    }
  });

  validationSignin
  .then(function(success) {
    error_type = 0;
    response.redirect('/');
    console.log(success);
  })
  .catch(function(error) {
    signin_error = error;
    error_type = 1;
    response.redirect('/');
  });
});

app.post('/signup.html', function(request, response) {
  login = request.body.login.trim();
  password = request.body.password.trim();
  confpassword = request.body.confpassword.trim();
  email = request.body.email.trim();
  confemail = request.body.confemail.trim();
  country = request.body.country.trim();

  var validationSignup = new Promise((success,error) => {
    if(validator.isEmpty(login) || validator.isEmpty(password) || validator.isEmpty(confpassword) || validator.isEmpty(email) || validator.isEmpty(confemail) || validator.isEmpty(country)){
      error('Tout les champs ne sont pas complets !');
    } else if (/\s/.test(login)) {
      error('Votre pseudo ne doit pas contenir d\'espace !');
    } else if (entities.encode(login) != login) {
      error('Votre pseudo n\'est pas valide !');
    } else if (login.length < 5) {
      error('Votre pseudo doit contenir 5 caractères minimum !');
    } else if (password.length < 5) {
      error('Votre mot de passe doit contenir 5 caractères minimum !');
    } else if (password != confpassword) {
      error('Les mots de passe ne correspondent pas !');
    } else if (validator.isEmail(email) == false) {
      error('Votre email est invalide !');
    } else if (email != confemail) {
      error('Les email ne correspondent pas !');
    } else if (validator.isEmpty(login) == false && validator.isEmpty(email) == false) {
      connection.query("SELECT * FROM broquiz_user WHERE user_login = '"+login+"'", function (err, result, fields) {
        if (result[0] != undefined) {
          error('Ce pseudo est déjà utilisé !');
        }
      });
      connection.query("SELECT * FROM broquiz_user WHERE user_email = '"+email+"'", function (err, result, fields) {
        if (result[0] != undefined) {
          error('Cet email est déjà utilisé !');
        } else {
          success('Tous les champs sont valides')
        }
      });
    }
  })

  validationSignup
  .then(function(success) {
    login = entities.encode(login);
    hashPwd(password);
    newpassword = passwordData.passwordHash;
    if (country.indexOf('(') != -1) {
      country = (country.slice(0,country.indexOf('(')));
    }
    getDate();
    var dt = datetime.create();
    var creation = dt.format('Y/m/d H:M:S');

    var sql = "INSERT INTO broquiz_user (user_login, user_email, user_password, user_salt, user_country, user_creation, user_points, user_status, user_role) VALUES ?";
    var values = [[login, email, newpassword, salt, country, creation, 0, 3, 2]];

    connection.query(sql , [values], function (err, result) {
      if (err) throw err;
    });

    login = undefined;
    password = undefined;
    confpassword = undefined;
    email = undefined;
    confemail = undefined;
    country = undefined;

    signup_error = undefined;

    response.redirect('/');
  })
  .catch(function(error) {
    signup_error = error;
    error_type = 2;
    response.redirect('/');
  });

});

app.listen(8080);
