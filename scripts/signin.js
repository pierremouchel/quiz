signin_login = login;
signin_password = password;

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
  } else if (validator.isEmail(signin_login)) {
    connection.query("SELECT user_id, user_email, user_password, user_salt FROM broquiz_user WHERE user_email = '"+signin_login+"'", function (err, result, fields) {
      if (result[0] == undefined) {
        error('Cet email n\'existe pas !');
      } else {
        if (sha512(signin_password, result[0].user_salt).passwordHash == result[0].user_password) {
          socket.handshake.session.user_id = result[0].user_id;
          socket.handshake.session.user_login = result[0].user_login;
          socket.handshake.session.save();
          success('Connected');
        } else {
          error('Mot de passe éronné !')
        }
      }
    });
  } else {
    connection.query("SELECT user_id, user_login, user_password, user_salt FROM broquiz_user WHERE user_login = '"+signin_login+"'", function (err, result, fields) {
      if (result[0] == undefined) {
        error('Ce login n\'existe pas !');
      } else {
        if (sha512(signin_password, result[0].user_salt).passwordHash == result[0].user_password) {
          socket.handshake.session.user_id = result[0].user_id;
          socket.handshake.session.user_login = result[0].user_login;
          socket.handshake.session.save();
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
  socket.emit('redirect', '/accueil');
})
.catch(function(error) {
  socket.emit('connection_error', error);
});
