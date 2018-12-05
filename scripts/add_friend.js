friend_login = request.body.friendLogin.trim();

var validationFriend = new Promise((success,error) => {
  if(validator.isEmpty(friend_login)){
    error('Le champ est vide !');
  } else if (validator.isEmpty(friend_login) == false && validator.isEmail(friend_login)) {
    connection.query("SELECT user_id, user_login FROM broquiz_user WHERE user_login = '"+friend_login+"'", function (err, result, fields) {
      if (result[0] == undefined) {
        error('Ce pseudo n\'existe pas !');
      } else {
        success('Succès');
      }
    });
  }
});

validationFriend
.then(function(success) {
  response.redirect('/accueil');
})
.catch(function(error) {
  console.log(error);
  response.redirect('/');
});
