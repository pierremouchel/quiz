friend_login = request.body.friendLogin.trim();

var validationFriend = new Promise((success,error) => {
  console.log(request.session.user_id);
  if(validator.isEmpty(friend_login)){
    error('Le champ est vide !');
  } else {
    connection.query("SELECT user_id, user_login FROM broquiz_user WHERE user_login = '"+friend_login+"'", function (err, result, fields) {
      if (result[0] == undefined) {
        error('Ce pseudo n\'existe pas !');
      } else {
        console.log(result[0].user_id);
        var sql = "INSERT INTO friend (friend1_id, friend2_id, friend_status) VALUES ?";
        var values = [[request.session.user_id, result[0].user_id, 1]];

        connection.query(sql , [values], function (err, result) {
          if (err) throw err;
          success('Demande d\'ami envoyée !');
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
