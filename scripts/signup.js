signup_login = login;
signup_password = password;
signup_confpassword = confpassword;
signup_email = email;
signup_confemail = confemail;
signup_country = country;

var validationSignup = new Promise((success,error) => {
  if(validator.isEmpty(signup_login) || validator.isEmpty(signup_password) || validator.isEmpty(signup_confpassword) || validator.isEmpty(signup_email) || validator.isEmpty(signup_confemail) || validator.isEmpty(signup_country)){
    error('Tout les champs ne sont pas complets !');
  } else if (/\s/.test(signup_login)) {
    error('Votre pseudo ne doit pas contenir d\'espace !');
  } else if (entities.encode(signup_login) != signup_login) {
    error('Votre pseudo n\'est pas valide !');
  } else if (signup_login.length < 5) {
    error('Votre pseudo doit contenir 5 caractères minimum !');
  } else if (signup_password.length < 5) {
    error('Votre mot de passe doit contenir 5 caractères minimum !');
  } else if (signup_password != signup_confpassword) {
    error('Les mots de passe ne correspondent pas !');
  } else if (validator.isEmail(signup_email) == false) {
    error('Votre email est invalide !');
  } else if (signup_email != signup_confemail) {
    error('Les email ne correspondent pas !');
  } else if (validator.isEmpty(signup_login) == false && validator.isEmpty(signup_email) == false) {
    connection.query("SELECT * FROM broquiz_user WHERE user_login = '"+signup_login+"'", function (err, result, fields) {
      if (result[0] != undefined) {
        error('Ce pseudo est déjà utilisé !');
      }
    });
    connection.query("SELECT * FROM broquiz_user WHERE user_email = '"+signup_email+"'", function (err, result, fields) {
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
  signup_login = entities.encode(signup_login);
  hashPwd(signup_password);
  newpassword = passwordData.passwordHash;
  if (signup_country.indexOf('(') != -1) {
    signup_country = (signup_country.slice(0,signup_country.indexOf('(')));
  }
  getDate();
  var dt = datetime.create();
  var creation = dt.format('Y/m/d H:M:S');

  var sql = "INSERT INTO broquiz_user (user_login, user_email, user_password, user_salt, user_country, user_creation, user_points, user_status, user_role) VALUES ?";
  var values = [[signup_login, signup_email, newpassword, salt, signup_country, creation, 0, 3, 2]];

  connection.query(sql , [values], function (err, result) {
    if (err) throw err;
  });

  signup_error = undefined;

  connection.query("SELECT user_id, user_login FROM broquiz_user WHERE user_login = '"+signup_login+"'", function (err, result, fields) {
    socket.handshake.session.user_id = result[0].user_id;
    socket.handshake.session.user_login = result[0].user_login;
    socket.handshake.session.save();

    signup_login = undefined;
    signup_password = undefined;
    signup_confpassword = undefined;
    signup_email = undefined;
    signup_confemail = undefined;
    signup_country = undefined;

    socket.emit('connection_redirect', '/accueil');
  });
})
.catch(function(error) {
  signup_error = error;
  error_type = 2;
  socket.emit('connection_redirect', '/');
});
