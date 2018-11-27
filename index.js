var express = require('express');
var bodyParser = require("body-parser");

var app = express();

app.use(express.static(__dirname+'/'));
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', function(req, res) {
    res.render('index.ejs');
});

app.listen(8080);

app.post('/connect.html', function(request, response) {
  var login = request.body.connectLogin;
  var password = request.body.connectPassword;
  console.log(login + " " + password);
});
