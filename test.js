var async = require('async');
var mysql = require('mysql');

var connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : '',
  database : 'broquiz'
});

connection.connect(function(err){});

function getLoginRequest() {
  return new Promise(function(resolve, reject) {
    setTimeout(function() {
      connection.query("SELECT * FROM broquiz_user WHERE user_login = 'michel'", function (err, result, fields) {
        if (err) {
          reject(new Error('Request error'));
        } else {
          resolve(result);
        }
      });
    }, 0);
  });
}

async function getLogin() {
  let login;
  try {
    login = await getLoginRequest();
  } catch (err) {
    login = 'Request error';
  }
  console.log(login);
}

getLogin();
