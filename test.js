var mysql      = require('mysql');
var validator = require('validator');
const Entities = require('html-entities').AllHtmlEntities;

var connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : '',
  database : 'broquiz'
});

connection.connect(function(err){});
const entities = new Entities();

var login = 'michel';
var password = 'passe';
var confpassword = 'passe';
var email = 'mouchelp7253@gmail.com';
var confemail = 'mouchelp7253@gmail.com';
var country = 'France';

var validation = new Promise((success,error) => {
  let key = 0;
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

validation
.then(function(succes) {
  app.get('/', function(request, response) {
    if (typeof error == 'undefined') {
      response.render('index.ejs');
    } else {
      response.render('index.ejs',{error:error,login:login,password:password,confpassword:confpassword,email:email,confemail:confemail,country:country});
    }
  });
})
.catch(function(error) {
  console.log(error);
});

/*var promise = new Promise( (succes,error) => {
  connection.query("SELECT * FROM broquiz_user WHERE user_login = 'michel'", function (err, result, fields) {
    if (result[0] != undefined) {
      succes(result)
    } else {
      error('non')
    }
  });
})

promise
.then(function(succes) {
  console.log(succes);
})
.catch(function(error) {
  console.log('There has been a problem with your fetch operation: ');
});*/
