var express = require('express'); //Source und Dokumentation: https://expressjs.com/
var bodyParser = require('body-parser'); //Source und Dokumentation: https://github.com/expressjs/body-parser
var app = express(); //Initialisiere Router für Express

app.use(express.static(__dirname + "/public")); //Express den Pfad für files in /public zeigen

app.use('/public', express.static(__dirname + '/public')); //Express den Pfad für files in /public zeigen

app.use(bodyParser.urlencoded({
  extended: false
}));

app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));

/**
* Zeigt der App die verschiedenen .js files mit Pfadangaben
*/
app.use('/', require('./public/index.js')); 
app.use('/german', require('./public/german_router.js'));
app.use('/international', require('./public/international_router.js'));
app.listen(3000);
console.log("Server hört auf Port: 3000\n");