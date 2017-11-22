var express = require('express'); //Source und Dokumentation: http://expressjs.com/de/
var router = express.Router(); //Initialisiere Router für Express
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
var path = require('path')
/**
 * @description HTML-Tags die cheerio fürs Parsen berücksichtigen soll
 */
var htmlTags = 'p,h1,h2,h3,h4,table,ul,ol,a,test,codesnippet';

/**
 * @description Pfad von Ordner in dem Texte gespeichert sind und in dem HTML-Dateien abzulegen sind
 */
var ordnerPfad = "./public/uploads/";

/**
 * @description Löscht nach Upload die Dateien die temporär gespeichert wurden (.docx und .html)
 * @name post/loeschen
 * @param req liefert den zu löschenden Dateinamen
 * @param res sendet eine Bestätigung
 */
router.post('/loeschen', function (req, res) {
  arrFiles = [];
  fs.readdirSync(ordnerPfad).forEach(file => {
    arrFiles.push(file);
  });

  for (i = 0; i < arrFiles.length; i++){
    fs.unlinkSync(ordnerPfad+arrFiles[i]);
  }
  res.send("ok");
  
});

/**
 * @description Überprüfung welche Optionen ausgewählt wurden
 * @name post/check_options
 * @todo Noch nicht fertig implementiert, bisher nur die Lieferung ob checked == true or == false, muss noch in String eingebaut werden
 */
router.post('/check_options', function(req, res){
  console.log(req.body.codeSnippet);
  res.send("ok");
});

/**
 * @description Liefert alle Kategorien unter die deutsche Artikel abgelegt werden dürfen, wird beim Öffnen der App ausgeführt
 * @name get/get_kategorien
 * @param req 
 * @param res 
 */
router.get('/get_kategorien', function(req, res) {

  // GET-Request an TYPO3, liefert alle Kategorien unter die gepostet werden darf
  request('http://localhost/api/rest-api-client/get_all_kategorien', function(error, response, body){

    //Sendet alle Kategorien mit "title" und "uid" an Controller
    res.send(body);
  })
});


/**
 * @description Liefert alle deutschen Artikel, die für den internationalen Artikelupload benötigt werden
 * @name get/get_ger_article
 * @param req 
 * @param res 
 */
router.get('/get_ger_article', function(req, res) {

  // GET-Request an TYPO3, liefert alle deutschen Artikel mit 'title'
  request('http://localhost/api/rest-api-client/get_all_ger_article', function(error, response, body){

    //Sendet alle deutschen Artikel mit "title" und "uid" an Controller
    res.send(body);
  })
});

/**
 * @description  Transformiert die HTML-Datei (die aus der .docx-Datei entstand) in einen JSON-Datensatz
 * @name get/get_ger_article
 * @param req 
 * @param res 
 * @todo Bitte noch Algorithmus verbessern, läuft noch nicht sauber ab!
 * @todo Texte müssen noch so umgestaltet werden, dass z.B. Title an erster Stelle steht. Algorithmus so umbauen, dass die Texte wie sie von der Agentur geliefert werden benutzt werden können.
 */
function transformToJSON (req, ordnerPfad, htmlFileName){

  const $ = cheerio.load(fs.readFileSync(ordnerPfad + htmlFileName)); //HTML-Datei mit cheerio laden
  
  /*if (pContent.includes('{{') && pContent.includes('}}')){
    var strOriginal = $(htmlTags).eq(t+1).html();
    var newStr = strOriginal.substring(strOriginal.lastIndexOf('{')+1,strOriginal.lastIndexOf('}')-1);
    var res = newStr.split('|');
    var buildStr = "<link "+res[1]+" - external-link-window \""+res[2]+"\">"+res[0]+"</link>";
    newStr = "{{" + newStr + "}}";
    var nochStrOriginal = strOriginal.replace(newStr,buildStr);
    var pContentNew = "<p>"+nochStrOriginal+"</p>";
    pContent = pContentNew;
  }*/
  
  var codeIndexes = [];
  
  $('p').each(function(i, elem){
    if($(this).text().startsWith('**CODE**')){
      codeIndexes.push(i);
    }
  });

  var lange = codeIndexes.length/2;

  var inhaltLange = [];
  for(r = 0; r < lange; r++){
    inhaltLange.push(codeIndexes[0]);
    inhaltLange.push(codeIndexes[1]-codeIndexes[0]-1);
    $('p').eq(codeIndexes[0]).empty();
    $('p').eq(codeIndexes[1]).empty();
    codeIndexes.shift();
    codeIndexes.shift();
  }

  console.log(inhaltLange)
  for(dc = 0; dc < lange; dc++){
    for(cd = 0; cd < inhaltLange[1]; cd++){
        //inhaltLange[0] = inhaltLange[0]+1;
        console.log(inhaltLange[0]+1);
      
        var lul = $('p').eq(inhaltLange[0]+1);
        var lal = $('p').eq(inhaltLange[0]+1).text()
        var lel = $('<codesnippet>'+lal+'</codesnippet>');
        $(lul).replaceWith(lel);
       
        //$('p').eq(inhaltLange[0]).replaceWith('<codesnippet>Toller Text</codesnippet>')
        //var codeSn = $('p').eq(inhaltLange[0]);
        //var codeSnNew = $('<codesnippet>'+$('p').eq(inhaltLange[0]).text()+'</codesnippet>');
        //codeSn.replaceWith(codeSnNew);
        //$('codesnippet').empty();
        
       
    }
    var zahl = inhaltLange[1];
    inhaltLange.shift();
    inhaltLange.shift();
    inhaltLange[0] -=zahl;
  }



  //Ändert alle Tags für Tippboxen von <p> in <test>
  $('p').each(function(i, elem){
    if($(this).text().startsWith('[[')&&$(this).text().endsWith(']]') ){
      var test = $('<test>'+$(this).text()+'</test>');

      $(this).replaceWith(test);
    }
  });



  //Alle Images löschen mit Bildunterschrift und Alt-Tag
  $('img').each(function(i, elem){
    var zahler = $(this).parent().index();
    $(htmlTags).eq(zahler+3).replaceWith('');
    $(htmlTags).eq(zahler+2).replaceWith('');
    $(this).replaceWith('');
  });
  

    
  

  /** Hier wird der initiale JSON-Datensatz angelegt
  * @todo Es wird noch alles in das Feld 'content[]' gespeichert, schöner wäre unterschiedliche Felder (meta, content, ...)
  */
  var jsonData = {
    content: []
  };

  /** 
  * Der erste Push beinhaltet die KategorieId, Title, Description und Teaser
  * Wird mit Hilfe von cheerio richtig geparst
  * @todo Texte müssen mit "Titel" anfangen, sonst stimmen die Werte nicht, das ist unschön. Besser wenn Texte nicht bearbeitet werden müssen
  * @todo Für die internationalisierung wird die 'kategorieid' nicht klappen, da hierfür die 'pid' von 'pages' des deutschen Textes gebraucht wird
  */
  jsonData.content.push({
    'kategorieid': req.body.KategorieID,
    'artikelID' : req.body.artikelID,
    'laenderCode' : req.body.laenderCode,
    'title': $('p').eq(1).text(),
    'description': $('p').eq(3).text(),
    'teaser': $('p').eq(5).text()
  });

  // Initialisierung der Schleife die über alle gefundenen HTML-Tags geht, die in htmlTags enthalten sind (als String)
  for (i = 7; i < $(htmlTags).get().length; i++) {

    //H1: Text extrahieren der mit dem <h1>-Tag umschlossen ist
    if ($(htmlTags).get(i).tagName == "h1") {

      var ueberschriftEins = $(htmlTags).eq(i).text(); //H1-Überschrift innerhalb von <h1>...</h1>

      // H1-Überschrift zum JSON-Datensatz hinzufügen, KEY: 'h1'
      jsonData.content.push({
        'h1': ueberschriftEins
      });
    }

    //H2 und P: Text extrahieren der mit dem <h2>- und folgendem <p>-Tag umschlossen ist
    else if ($(htmlTags).get(i).tagName == "h2") {

      var pContent = ""; // Alles was innerhalb von <p>...</p> steht abspeichern

      var ueberschriftZwei = $(htmlTags).eq(i).text(); //H2-Überschrift innerhalb von <h2>...</h2>

      var htmlBody = ""; // Wird benötigt um HTML-Code aus dem Worddokument abzuspeichern (Embed Videos)

      var htmlBodydecoded = ""; // Dekodierter HTML Code, der in den JSON-Datensatz kommt

      //Die Schleife geht nur soweit, bis das nächste passende Element gefunden wurde um eine neue Content-Box anzulegen
      for (t = i; t < i + $(htmlTags).eq(i).nextUntil('h1,h2,h3,h4,table,test,codesnippet').length; t++) {

        if ($(htmlTags).get(t + 1).tagName == "p") {

          if (($(htmlTags).eq(t + 1).html()).startsWith("&lt;iframe")) {

            htmlBody = $(htmlTags).eq(t + 1).html(); //Reiner undekodierter HTML-Code der innerhalb von <iframe...>...</iframe> gefunden wurde

            htmlBodydecoded = he.decode(htmlBody); //Dekodierer, aus z.B.: "&lt;" wird "<"
          }  else {

            pContent += "<p>" + $(htmlTags).eq(t + 1).html() + "</p>"; //Normaler Text innerhalb <p>...</p>

            if (pContent.includes('{{') && pContent.includes('}}')){
              var strOriginal = $(htmlTags).eq(t+1).html();
              var newStr = strOriginal.substring(strOriginal.lastIndexOf('{')+1,strOriginal.lastIndexOf('}')-1);
              var res = newStr.split('|');
              var buildStr = "<link "+res[1]+" - external-link-window \""+res[2]+"\">"+res[0]+"</link>";
              newStr = "{{" + newStr + "}}";
              var nochStrOriginal = strOriginal.replace(newStr,buildStr);
              var pContentNew = "<p>"+nochStrOriginal+"</p>";
              pContent = pContentNew;
            }
              
          }

        //Diese Bedingung schaut ob und wo es eine Unordered List gibt, die mit <ul> anfängt
        } else if ($(htmlTags).get(t + 1).tagName == "ul") {

          pContent += "<ul>" + $(htmlTags).eq(t + 1).html() + "</ul>";

          $(htmlTags).eq(t + 1).empty();

        //Diese Bedingung schaut ob und wo es eine Ordered List gibt, die mit <ol> anfängt
        } else if ($(htmlTags).get(t + 1).tagName == "ol") {

          pContent += "<ol>" + $(htmlTags).eq(t + 1).html() + "</ol>";

          $(htmlTags).eq(t + 1).empty();
        }
      }

      //Die Schleife ist nötig um den Zähler zurückzusetzen, wenn Schleife nicht läuft, dann werden immer die alten Tags noch angeschaut
      for (t = i; t < i + $(htmlTags).eq(i).nextUntil('h1,h2,h3,h4,table,test,codesnippet').length; t++) {
        $(htmlTags).eq(t + 1).empty();
      }

      /*
        H2-Überschrift mit "normalem" Text in den JSON-Datensatz aufnehmen
        D.h. nur Überschrift und Text, kein Text alleine
      */
      jsonData.content.push({
        'h2': ueberschriftZwei,
        'p': pContent
      });

      //Abspeichern von HTML-Code aus der .docx in den JSON-Datensatz
      if (htmlBody != "") {
        jsonData.content.push({
          'htmlbody': htmlBodydecoded,
          'noheaderhtml': ''
        });
      }
    }
      
    //H3 und P: Text extrahieren der mit dem <h3>- und folgendem <p>-Tag umschlossen ist
    else if ($(htmlTags).get(i).tagName == "h3") {

      var pContent = ""; // Alles was innerhalb von <p>...</p> steht abspeichern

      var ueberschriftDrei = $(htmlTags).eq(i).text(); //H3-Überschrift innerhalb von <h3>...</h3>

      var htmlBody = ""; // Wird benötigt um HTML-Code aus dem Worddokument abzuspeichern (Embed Videos)

      var htmlBodydecoded = ""; // Dekodierter HTML Code, der in den JSON-Datensatz kommt

      //Die Schleife geht nur soweit, bis das nächste passende Element gefunden wurde um eine neue Content-Box anzulegen
      for (t = i; t < i + $(htmlTags).eq(i).nextUntil('h1,h2,h3,h4,table,test,codesnippet').length; t++) {

        if ($(htmlTags).get(t + 1).tagName == "p") {

          if (($(htmlTags).eq(t + 1).html()).startsWith("&lt;iframe")) {

            htmlBody = $(htmlTags).eq(t + 1).html(); //Reiner undekodierter HTML-Code der innerhalb von <iframe...>...</iframe> gefunden wurde

            htmlBodydecoded = he.decode(htmlBody); //Dekodierer, aus z.B.: "&lt;" wird "<"

          } else {

            pContent += "<p>" + $(htmlTags).eq(t + 1).html() + "</p>"; //Normaler Text innerhalb <p>...</p>

            if (pContent.includes('{{') && pContent.includes('}}')){
              var strOriginal = $(htmlTags).eq(t+1).html();
              var newStr = strOriginal.substring(strOriginal.lastIndexOf('{')+1,strOriginal.lastIndexOf('}')-1);
              var res = newStr.split('|');
              var buildStr = "<link "+res[1]+" - external-link-window \""+res[2]+"\">"+res[0]+"</link>";
              newStr = "{{" + newStr + "}}";
              var nochStrOriginal = strOriginal.replace(newStr,buildStr);
              var pContentNew = "<p>"+nochStrOriginal+"</p>";
              pContent = pContentNew;
            }
              
          }

        //Diese Bedingung schaut ob und wo es eine Unordered List gibt, die mit <ul> anfängt
        } else if ($(htmlTags).get(t + 1).tagName == "ul") {

          pContent += "<ul>" + $(htmlTags).eq(t + 1).html() + "</ul>";

          $(htmlTags).eq(t + 1).empty();

        //Diese Bedingung schaut ob und wo es eine Ordered List gibt, die mit <ol> anfängt
        } else if ($(htmlTags).get(t + 1).tagName == "ol") {

          pContent += "<ol>" + $(htmlTags).eq(t + 1).html() + "</ol>";

          $(htmlTags).eq(t + 1).empty();
        }
      }

      //Die Schleife ist nötig um den Zähler zurückzusetzen, wenn Schleife nicht läuft, dann werden immer die alten Tags noch angeschaut
      for (t = i; t < i + $(htmlTags).eq(i).nextUntil('h1,h2,h3,h4,table,test,codesnippet').length; t++) {
        $(htmlTags).eq(t + 1).empty();
      }

      /*
        H3-Überschrift mit "normalem" Text in den JSON-Datensatz aufnehmen
        D.h. nur Überschrift und Text, kein Text alleine
      */
      jsonData.content.push({
        'h3': ueberschriftDrei,
        'p': pContent
      });

      //Abspeichern von HTML-Code aus der .docx in den JSON-Datensatz
      if (htmlBody != "") {
        jsonData.content.push({
          'htmlbody': htmlBodydecoded,
          'noheaderhtml': ''
        });
      }
    }
  
    //H4 und P: Text extrahieren der mit dem <h4>- und folgendem <p>-Tag umschlossen ist
    else if ($(htmlTags).get(i).tagName == "h4") {

      var pContent = ""; // Alles was innerhalb von <p>...</p> steht abspeichern

      var ueberschriftVier = $(htmlTags).eq(i).text(); //H4-Überschrift innerhalb von <h4>...</h4>

      var htmlBody = ""; // Wird benötigt um HTML-Code aus dem Worddokument abzuspeichern (Embed Videos)

      var htmlBodydecoded = ""; // Dekodierter HTML Code, der in den JSON-Datensatz kommt

      //Die Schleife geht nur soweit, bis das nächste passende Element gefunden wurde um eine neue Content-Box anzulegen
      for (t = i; t < i + $(htmlTags).eq(i).nextUntil('h1,h2,h3,h4,table,test,codesnippet').length; t++) {

        if ($(htmlTags).get(t + 1).tagName == "p") {

          if (($(htmlTags).eq(t + 1).html()).startsWith("&lt;iframe")) {

            htmlBody = $(htmlTags).eq(t + 1).html(); //Reiner undekodierter HTML-Code der innerhalb von <iframe...>...</iframe> gefunden wurde

            htmlBodydecoded = he.decode(htmlBody); //Dekodierer, aus z.B.: "&lt;" wird "<"

          } else {

            pContent += "<p>" + $(htmlTags).eq(t + 1).html() + "</p>"; //Normaler Text innerhalb <p>...</p>

            if (pContent.includes('{{') && pContent.includes('}}')){
              var strOriginal = $(htmlTags).eq(t+1).html();
              var newStr = strOriginal.substring(strOriginal.lastIndexOf('{')+1,strOriginal.lastIndexOf('}')-1);
              var res = newStr.split('|');
              var buildStr = "<link "+res[1]+" - external-link-window \""+res[2]+"\">"+res[0]+"</link>";
              newStr = "{{" + newStr + "}}";
              var nochStrOriginal = strOriginal.replace(newStr,buildStr);
              var pContentNew = "<p>"+nochStrOriginal+"</p>";
              pContent = pContentNew;
            }
              
          }

        //Diese Bedingung schaut ob und wo es eine Unordered List gibt, die mit <ul> anfängt
        } else if ($(htmlTags).get(t + 1).tagName == "ul") {

          pContent += "<ul>" + $(htmlTags).eq(t + 1).html() + "</ul>";

          $(htmlTags).eq(t + 1).empty();

        //Diese Bedingung schaut ob und wo es eine Ordered List gibt, die mit <ol> anfängt
        } else if ($(htmlTags).get(t + 1).tagName == "ol") {

          pContent += "<ol>" + $(htmlTags).eq(t + 1).html() + "</ol>";

          $(htmlTags).eq(t + 1).empty();
        }
      }

      //Die Schleife ist nötig um den Zähler zurückzusetzen, wenn Schleife nicht läuft, dann werden immer die alten Tags noch angeschaut
      for (t = i; t < i + $(htmlTags).eq(i).nextUntil('h1,h2,h3,h4,table,test,codesnippet').length; t++) {
        $(htmlTags).eq(t + 1).empty();
      }

      /*
        H4-Überschrift mit "normalem" Text in den JSON-Datensatz aufnehmen
        D.h. nur Überschrift und Text, kein Text alleine
      */
      jsonData.content.push({
        'h4': ueberschriftVier,
        'p': pContent
      });

      //Abspeichern von HTML-Code aus der .docx in den JSON-Datensatz
      if (htmlBody != "") {
        jsonData.content.push({
          'htmlbody': htmlBodydecoded,
          'noheaderhtml': ''
        });
      }
    }

    //codesnippets
    else if ($(htmlTags).get(i).tagName == "codesnippet"){
      var snippetString = $(htmlTags).eq(i).html();
      
      for (t = i; t < i + $(htmlTags).eq(i).nextUntil('h1,h2,h3,h4,table,test,p').length; t++) {
        if($(htmlTags).eq(t+1).html()!=""){
          snippetString += "\n"+$(htmlTags).eq(t+1).html();
          $(htmlTags).eq(t + 1).empty();
        }
      }
      
      if(snippetString!=""){
        console.log(snippetString);
        jsonData.content.push({
          'codeSnippet': snippetString,
          'leer': '',
          'noHeaderCodeSnippet': ''
        });
        
      }
    }
    /*
      TABELLE: Tabelle so tranfsormieren, damit nach jeder Zelle ein Seperator gesetzt wird
   */
    else if ($(htmlTags).get(i).tagName == "table") {
      var arr = [];      
      cheerioTableParser($);
      var data = $(htmlTags).eq(i).parsetable(true, true, true);
      for(spalten = 0; spalten < data[0].length; spalten++){
        var stri = "";
        for (zeilen = 0; zeilen < data.length; zeilen++){
          stri += data[zeilen][spalten];
          if(data[zeilen+1] != null){
            stri += "|";
          }
        }
        arr.push(stri);
      }
      var arrayToString = arr.join("\n")
      $(htmlTags).eq(i).empty();
      jsonData.content.push({
        'table': arrayToString,
        'nein': ''
      });
    }

    //Tippboxen setzen!
    else if ($(htmlTags).get(i).tagName == "test"){
        var strOriginal = $(htmlTags).eq(i).html();
        var newStr = strOriginal.substring(strOriginal.lastIndexOf('[')+1,strOriginal.lastIndexOf(']')-1);
        var res = newStr.split('==');
       
        if (res[1].includes('{{') && res[1].includes('}}')){
          
          var strOriginalInner = res[1];
          
          var newStrInner = strOriginalInner.substring(strOriginalInner.lastIndexOf('{')+1,strOriginalInner.lastIndexOf('}')-1);
          var resInner = newStrInner.split('|');
          var buildStrInner = "<link "+resInner[1]+" - external-link-window \""+resInner[2]+"\">"+resInner[0]+"</link>";
          newStrInner = "{{" + newStrInner + "}}";
          var nochStrOriginalInner = strOriginalInner.replace(newStrInner,buildStrInner);
          res[1] = nochStrOriginalInner;
          
        }

        if(res[0]=="Tipp" || res [0]=="Tip"){
          jsonData.content.push({
            'tippBoxTitle' : res[0],
            'tippBoxContent' : res[1],
            'layout' : '3',
            'icon': 'lightbulb-o'
          });
        } else if (res[0]=="Fakt" || res [0]=="Fact"){
          jsonData.content.push({
            'tippBoxTitle' : res[0],
            'tippBoxContent' : res[1],
            'layout' : '2',
            'icon': 'thumb-tack'
          });
        }

      
    }   
    //P: Text extrahieren der mit dem <p>-Tag umschlossen ist
    else if ($(htmlTags).get(i).tagName == "p") {

      var tocZahler = 0; //Initialer Zähler für die Inhaltsangabe

      /*
        Hier findet die Berechnung statt, an welcher Stelle die Inhaltsangabe ist,
        damit diese entsprechend in den JSON-Datensatz aufgenommen werden kann
      */
      for (t = i; t < i + $(htmlTags).eq(i).nextUntil('h1,h2,h3,h4,table,ul,test').length; t++) {
        if ($(htmlTags).eq(t + 1).text() == "_TABLE_OF_CONTENT_") {
          tocZahler = i + $(htmlTags).eq(i).nextUntil('h1,h2,h3,h4,table,ul,test').length - $(htmlTags).eq(t + 1).index();
        }
      }

      /*
        Abspeichern der Inhaltsangabe an entsprechender Stelle
        Hier wird kein Inhalt aufgenommen, sondern der Wert: 'toc_toc'
        TYPO3 interpretiert 'toc_toc' als Inhaltsangabe, deshalb wird hier nur ein String abgespeichert
      */
      if ($(htmlTags).eq(i).text() == "_TABLE_OF_CONTENT_") {
        jsonData.content.push({
          'toc': 'toc_toc'
        });

        // Zurücksetzen des Zählers der Inhaltsangabe
        tocZahler = 0;
        $(htmlTags).eq(i).empty();
      }

      var pContent = "<p>" + $(htmlTags).eq(i).text() + "</p>"; // Alles was innerhalb von <p>...</p> steht abspeichern

      if ($(htmlTags).eq(i).text() != "") {
        for (t = i; t < i + $(htmlTags).eq(i).nextUntil('h1,h2,h3,h4,table,ul,test,codesnippet').length - tocZahler; t++) {
          if ($(htmlTags).eq(t + 1).html() != "_TABLE_OF_CONTENT_") {
            pContent += "<p>" + $(htmlTags).eq(t + 1).html() + "</p>";
          }
        }
        for (t = i; t < i + $(htmlTags).eq(i).nextUntil('h1,h2,h3,h4,table,ul,test,codesnippet').length - tocZahler; t++) {
          if ($(htmlTags).eq(t + 1).text() != "_TABLE_OF_CONTENT_") {
            $(htmlTags).eq(t + 1).empty();
          }
        }

        //Abspeichern des Textes innerhalb der <p>-Tags in den JSON-Datensatz
        jsonData.content.push({
          'not': '',
          'p': pContent
        });
      }
    }
  }
console.log(jsonData);
  return jsonData; //Gibt den kompletten JSON-Datensatz in richtiger Reihenfolge zurück
}

module.exports = router;
module.exports.transformToJSON = transformToJSON;
module.exports.transformToJSONInt = transformToJSON;    