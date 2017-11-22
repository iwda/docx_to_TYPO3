var express = require('express');
var bodyParser = require('body-parser');
var app = express();

app.use(express.static(__dirname + "/public"));

app.use('/public', express.static(__dirname + '/public'));

app.use(bodyParser.urlencoded({
  extended: false
}));

app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));

app.use('/', require('./public/index.js'));
app.use('/german', require('./public/german_router.js'));
app.use('/international', require('./public/international_router.js'));
app.listen(3000);
console.log("Server hört auf Port: 3000\n");