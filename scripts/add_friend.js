friend_login = request.body.friendLogin.trim();
console.log(request.session.user_id);
var validationFriend = new Promise((success,error) => {
  if(validator.isEmpty(friend_login)){
    error('Le champ est vide !');
  } else {
    connection.query("SELECT user_id, user_login FROM broquiz_user WHERE user_login = '"+friend_login+"'", function (err, result, fields) {
      var friend_result = result[0].user_id;
      if (result[0] == undefined) {
        error('Ce pseudo n\'existe pas !');
      } else {
        connection.query("SELECT * FROM `friend` WHERE (`friend1_id` = "+request.session.user_id+" AND `friend2_id` = "+result[0].user_id+") OR (`friend1_id` = "+result[0].user_id+" AND `friend2_id` = "+request.session.user_id+")", function (err, result, fields) {
          if (result[0] != undefined) {
            if (result[0].friend_status == 1) {
              error('Votre demande à déjà été envoyé !');
            } else {
              error('Vous êtes déjà ami avec cette personne !');
            }

          } else {
            var sql = "INSERT INTO friend (friend1_id, friend2_id, friend_status) VALUES ?";
            var values = [[request.session.user_id, friend_result, 1]];

            connection.query(sql , [values], function (err, result) {
              if (err) throw err;
              success('Demande d\'ami envoyée !');
            });
          }
        });
      }
    });
  }
});

validationFriend
.then(function(success) {
  console.log(success);
  response.redirect('/accueil');
})
.catch(function(error) {
  console.log(error);
  response.redirect('/accueil');
});
