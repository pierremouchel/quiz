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

  signup_error = undefined;

  connection.query("SELECT user_id, user_login FROM broquiz_user WHERE user_login = '"+login+"'", function (err, result, fields) {
    request.session.user_id = result[0].user_id;
    request.session.user_login = result[0].user_login;

    login = undefined;
    password = undefined;
    confpassword = undefined;
    email = undefined;
    confemail = undefined;
    country = undefined;

    response.redirect('/accueil');
  });
})
.catch(function(error) {
  signup_error = error;
  error_type = 2;
  response.redirect('/');
});
