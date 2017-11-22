var express = require('express'); //Source und Dokumentation: http://expressjs.com/de/
var ger_router = express.Router(); //Initialisiere Router für Express
var mammoth = require('mammoth'); //Source und Dokumentation: https://www.npmjs.com/package/mammoth
var bodyParser = require('body-parser'); //Source und Dokumentation: https://github.com/expressjs/body-parser
var http = require('http'); //Source und Dokumentation: https://nodejs.org/api/http.html
var fs = require('fs'); //Source und Dokumentation: https://nodejs.org/api/fs.html
var he = require('he'); //Source und Dokumentation: https://github.com/mathiasbynens/he
var cheerio = require('cheerio'); //Source und Dokumentation: https://github.com/cheeriojs/cheerio
var cheerioTableParser = require('cheerio-tableparser'); //Source und Dokumentation: https://github.com/misterparser/cheerio-tableparser
var request = require('request'); //Source und Dokumentation: https://github.com/request/request
var multer = require('multer'); //Source und Dokumentation: https://github.com/expressjs/multer
var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest; 
var dateFormat = require('dateformat'); //Source und Dokumentation: https://github.com/felixge/node-dateformat
var router = require('./index.js');

/**
 * @description Bennung der HTML-Datei die von mammoth erstellt wird
 */
var htmlFileName;

/**
 * @description HTML-Tags die zur zu erstellenden HTML Datei angefügt werden sollen
 */
var htmlHeader = '<!DOCTYPE html><html><head><meta charset="UTF-8"></head><body>';

/**
 * @description HTML-Tags die zur zu erstellenden HTML Datei am Ende angefügt werden sollen
 */
var htmlBodyTag = "</body></html>";

/**
 * @description Pfad von Ordner in dem Texte gespeichert sind und in dem HTML-Dateien abzulegen sind
 */
var ordnerPfad = "./public/uploads/";
/**
 * @description Speichert für das Modul "multer", von wo kommt die Datei (filename) und wohin soll sie gespeichert werden (destination)
 * @param destination Angabe wohin die Datei gespeichert werden soll
 * @param filename Angabe woher die ausgewählte Datei kommt
 */
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, ordnerPfad);
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname);
    }
});
var upload = multer({ storage: storage });

/**
 * @description Deutsche Konvertierung von .docx in .html durch 'mammoth'. Wird bei der Dateiauswahl aufgerufen
 * @name post/convert_docx_to_html
 * @param req.file.originalname Liefert den Dateinamen der zu konvertierenden .docx-Datei
 * @param file In Html mit ID ausgezeichnet im deutschen Artikelupload
 */
ger_router.post('/convert_docx_to_html', upload.single('file'), function(req, res) {

  mammoth.convertToHtml({ path: ordnerPfad + req.file.originalname }).then(function(result) {

    var htmlInhalt = result.value; // HTML-Inhalt der Mammoth konvertiert hat

    htmlFileName = req.file.originalname; // Speichert den Dateinamen der .docx die ausgewählt wurde

    htmlFileName = htmlFileName.replace('.docx', '.html'); // Dateiendung .docx mit .html ersetzen
    
    // HTML-Datei in DE_TEXTE abspeichern, als erstes Pfad mit Dateiname, dann HTML-Inhalt (htmlHeader+htmlInhalt+htmlBodyTag)
    fs.writeFile(ordnerPfad + htmlFileName, htmlHeader + htmlInhalt + htmlBodyTag, function(err) {
      if (err) {
        return console.log(dateFormat() + " " + err);
      }
      console.log(dateFormat() + ": Datei wurde erfolgreich in HTML konvertiert und gespeichert.");
    });
  });
  res.send("200");
});

/**
 * @description Deutscher Artikelupload, Upload JSON-Datensatz zur REST-API von TYPO3
 * @name post/upload_typo_german
 * @param req Html-Inhalt der transformierten .docx
 * @param res Sendet eine Bestätigung an Frontend
 */
ger_router.post('/upload_typo_german', function(req, res) {

  var jsonContent = router.transformToJSON(req, ordnerPfad, htmlFileName); //JSON-Datensatz der z.B. über jsonContent.content[0].title angesprochen werden kann
   
  var jsonContentArray = JSON.stringify(jsonContent); //JSON-Datensatz in String konvertieren
    
  // Legt verschiedene Angaben für POST-Request an TYPO3 fest
  var options = {
    host: 'localhost',
    port: 80,
    path: '/api/rest-api-client/dokument',
    //path: '/foo', //zum Testen, damit der Upload in Leere läuft oder zu Typo3 hochgeladen wird
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(jsonContentArray)
    }
  };

  /**
   * POST-Request mit options ausführen
   * @todo Funktion umbauen mit GET!
   */
  var httpreq = http.request(options, function(response) {
    var antwort = '';
    response.setEncoding('utf8');
      response.on('data', function(chunk) {
        antwort +=chunk;
      });
      response.on('end', function() {
        res.send(antwort);
      });

  });
  httpreq.write(jsonContentArray);
  httpreq.end();
});

/**
 * @description Deutsche Artikelvorschau, Öffnet die Vorschau in einem neuen Fenster
 * @name get/vorschau_oeffnen
 * @param req Html-Inhalt der transformierten .docx
 * @param res Sendet Array an Frontend
 */
ger_router.get('/vorschau_oeffnen', function(req, res) {

  var resultTrans = router.transformToJSON(req, ordnerPfad, htmlFileName); //JSON-Datensatz der z.B. über jsonContent.content[0].title angesprochen werden 

  var inhalte = []; //Initiales Array das in richtiger Reihenfolge mit entsprechenden JSON-Daten gefüllt wird

  /** 
    JSON-htmlTags zum inhalte-Array hinzufügen
    @todo: Zu viel if/else if, Laufzeit-Probleme?! Schnellere Lösung! HTML-File bauen lassen!
  */
  inhalte.push("<!DOCTYPE html>");
  inhalte.push("<html>");
  inhalte.push("<head>");
  inhalte.push("<link href=\"../css/styling.css\" rel=\"stylesheet\">");
  inhalte.push("</head>");
  inhalte.push("<body>");
    for (i = 0; i < resultTrans.content.length; i++){
      var divZahl = "divID_" + i%2;
      if (resultTrans.content[i].title != undefined && resultTrans.content[i].description != undefined || resultTrans.content[i].teaser != undefined) {
        inhalte.push("<div id=\""+divZahl+"\" class=divClass>");
        inhalte.push("<b>Title:</b> " + resultTrans.content[i].title + "<br/>");
        inhalte.push("<b>Description:</b> " + resultTrans.content[i].description + "<br/>");
        inhalte.push("<b>Teaser:</b> " + resultTrans.content[i].teaser + "<br/>");
        inhalte.push("</div>");
      } else if (resultTrans.content[i].h1 != undefined){
        inhalte.push("<div id=\""+divZahl+"\" class=divClass>");
        inhalte.push("<div id=\"ueberschrift\">H1: " + resultTrans.content[i].h1 + "</div></b>");
        inhalte.push("</div>");
      } else if (resultTrans.content[i].p != undefined && resultTrans.content[i].h2 != undefined){
        inhalte.push("<div id=\""+divZahl+"\" class=divClass>");
        inhalte.push("<div id=\"ueberschrift\">H2: " + resultTrans.content[i].h2 + "</div><br/>");
        inhalte.push(resultTrans.content[i].p + "<br/>");
        inhalte.push("</div>");
      } else if (resultTrans.content[i].p != undefined && resultTrans.content[i].h3 != undefined){
        inhalte.push("<div id=\""+divZahl+"\" class=divClass>");
        inhalte.push("<div id=\"ueberschrift\">H3: " + resultTrans.content[i].h3 + "</div><br/>");
        inhalte.push(resultTrans.content[i].p + "<br/>");
        inhalte.push("</div>");
      } else if (resultTrans.content[i].p != undefined && resultTrans.content[i].h4 != undefined){
        inhalte.push("<div id=\""+divZahl+"\" class=divClass>");
        inhalte.push("<div id=\"ueberschrift\">H4: " + resultTrans.content[i].h4 + "</div><br/>");
        inhalte.push(resultTrans.content[i].p + "<br/>");
        inhalte.push("</div>");
      } else if (resultTrans.content[i].htmlbody != undefined && resultTrans.content[i].noheaderhtml != undefined){
        inhalte.push("<div id=\""+divZahl+"\" class=divClass>");
        inhalte.push("<div id=\"ueberschrift\">HTML-Code:</div><br/>"+resultTrans.content[i].htmlbody + "</br>");
        inhalte.push("</div>");
      } else if (resultTrans.content[i].not != undefined && resultTrans.content[i].p != undefined){
        inhalte.push("<div id=\""+divZahl+"\" class=divClass>");
        inhalte.push("<div id=\"ueberschrift\">Nur Text</div>"+resultTrans.content[i].p + "<br/>");
        inhalte.push("</div>");
      } else if (resultTrans.content[i].table != undefined && resultTrans.content[i].nein != undefined){
        inhalte.push("<div id=\""+divZahl+"\" class=divClass>");
        inhalte.push("<div id=\"ueberschrift\">Tabelle</div><br/><p id=\"tabelleneigenschaft\">"+resultTrans.content[i].table + "</p>");
        inhalte.push("</div></br>");
      } else if (resultTrans.content[i].toc != undefined){
        inhalte.push("<div id=\""+divZahl+"\" class=divClass>");
        //inhalte.push(resultTrans.content[i].toc + "<br/>");
        inhalte.push("<div id=\"ueberschrift\">Inhaltsangabe</div>");
        inhalte.push("</div>");
      } else if (resultTrans.content[i].codeSnippet != undefined && resultTrans.content[i].leer != undefined && resultTrans.content[i].noHeaderCodeSnippet != undefined){
        inhalte.push("<div id=\""+divZahl+"\" class=divClass>");
        inhalte.push("<div id=\"ueberschrift\">CodeSnippet</div><br/>"+resultTrans.content[i].codeSnippet + "</br>");
        inhalte.push("</div>");
      } else if (resultTrans.content[i].tippBoxTitle != undefined && resultTrans.content[i].tippBoxContent != undefined && resultTrans.content[i].icon != undefined){
        inhalte.push("<div id=\""+divZahl+"\" class=divClass>");
        inhalte.push("<div id=\"ueberschrift\">TipBox: "+resultTrans.content[i].tippBoxTitle+" -> "+resultTrans.content[i].icon+"</div><br/>"+resultTrans.content[i].tippBoxContent + "</br>");
        inhalte.push("</div>");
      }
    }

  inhalte.push("</body></html>"); 
  inhalte.push("</html>"); 
  res.send(inhalte.join("\n")); //Schickt das Array als einfachen String mit Hilfe von .join("") ans Frontend
});




module.exports = ger_router;