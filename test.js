var mysql      = require('mysql');

var connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : '',
  database : 'broquiz'
});

connection.connect(function(err){});

let promise = new Promise( (succes,error) => {
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
  //throw error;
})
.catch(function(error) {
  console.log('There has been a problem with your fetch operation: ');
  //throw error;
});
