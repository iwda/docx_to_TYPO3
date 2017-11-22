var myApp = angular.module('myApp', []);
myApp.controller('AppCtrl', ['$scope', '$http', '$window', function($scope, $http, $window) {

    /** 
     * @description ID der ausgewählten Sprache für internationalen Upload
     */
    var laenderCode;
 
    /**
     * @description Länderkürzel der ausgewählten Sprache für internationalen Upload
     */
    var laenderName;

      /**
     * @description Setzt den deutschen Artikel-Title für internationalen Artikelupload und gibt Vorschau frei
     * @name setSelectedInt
     * @todo HTML-IDs mit class setzen, damit nicht so viele einzelne IDs angesprochen werden müssen
     * @todo HTML ID von KategoriecheckgreenInt auf "GermanArticle..." setzen
     * @summary INTERNATIONAL
     */
    $scope.setSelectedInt = function() {
        var KategoriecheckgreenInt = document.getElementById('KategoriecheckgreenInt'); //Text und Icon wenn deutscher Title erfolgreich ausgewählt
        var KategoriecheckredInt = document.getElementById('KategoriecheckredInt'); //Text und Icon wenn deutscher Title NICHT erfolgreich ausgewählt
        $scope.selected = this.x;
        if($scope.selected.uid != 0){
            KategoriecheckgreenInt.style.display = ''; //Setzt Text und Icon von 'none' auf sichtbar
            KategoriecheckredInt.style.display = 'none'; //Setzt Text und Icon von sichtbar auf 'none'
            document.getElementById('katnameInt').innerHTML =  $scope.selected.title; //Ausgewählter deutscher Title in HTML hinzufügen
        } else { 
            KategoriecheckgreenInt.style.display = 'none';
            Kategoriecheckred.style.display = '';
        }
    };

     /**
     * @description Upload des internationalen Textes zu Typo3
     * @name postenInt
     * @summary INTERNATIONAL
     */
    $scope.postenInt = function() {
        var pfad = document.getElementById('fileInt').value; //itnernationaler Dateiname mit Endung
        var respfad = pfad.slice(12); //itnernationaler Dateiname ohne Endung
        var bestaetigen = confirm(
            "Möchten Sie den Artikel wirklich hochladen?\n\n"
            +"Datei: "+ respfad + "\n\n"
            +"Deutscher Title: " + $scope.selected.title + "\n\n"
            +"Sprache: " + laenderName +  "\n");
        //Wenn die Confirm-Box bestätigt wird, dann...
        if (bestaetigen== true){
            document.getElementById("loader").style.display = "block"; //Loading-Screen einschalten
            document.getElementById("großerContainer").style.filter = "blur(5px)"; //Applikation hinter dem Loading-Screen mit blur verzerren
            /**
             * @description Upload über Node-Server
             * @name post/upload_typo_international
             * @param $scope.selected.uid Title-ID des deutsche Artikels die vom User aus der gelieferten Typo3-Liste ausgewählt wurde
             * @param laenderCode Sprach-ID, die zu den entsrpachenden Sprachen gehört, die Typo3 akzeptiert
             */
            $http.post('http://localhost:3000/international/upload_typo_international',{
                "artikelID" : $scope.selected.uid,
                "laenderCode": laenderCode
            }).then(function(response) { //Sobald die POST-Methode fertig ist, verschwindet der Loading-Screen und die App wird wieder sichtbar
                document.getElementById("loader").style.display = "none";
                document.getElementById("großerContainer").style.filter = "blur(0px)";
                alert("Status: " + response.status + " Upload erfolgreich");
                /**
                 * @description Temporäre Dateien löschen über Node-Server
                 * @name post/loeschen
                 */
                $http.post('http://localhost:3000/loeschen',{
                    "dateiName" : document.getElementById('dokupfadInt').innerHTML
                });
                //Nachdem die Funktion beendet wurde, lädt die App neu an gleicher STelle an der der User war
                $window.location.reload();
            });    
        } else {
            console.log("Upload abgebrochen");
            $window.location.reload();
        }
    }


    $scope.vorschauInt = function(){
        var uploadtypogreenInt = document.getElementById('uploadtypogreenInt');
            var uploadtyporedInt = document.getElementById('uploadtyporedInt');
            uploadtypogreenInt.style.display = '';
            uploadtyporedInt.style.display = 'none';

            var auploadtypo3Int = document.getElementById('auploadtypo3Int');
            auploadtypo3Int.style.visibility = 'visible';
            auploadtypo3Int.href = "";
        $window.open('http://localhost:3000/international/vorschau_oeffnen_int', '_blank', 'width=50%');
    }


    /**
     * @description Speichert die Angabe ob Checkboxen gechecket sind oder nicht
     * @name speicherOptionen
     * @param codeSnippet {bool} sind CodeSnippets gecheckt
     * @param htmlCode {bool} ist HTMLCode gecheckt
     * @param ueberschrift {bool} sind Überschriften gecheckt
     * @todo Fertig implementieren, bisher nur codeSnippet implementiert, gewünscht nocht: Tabelle
     * @summary ALL
     */
    $scope.speicherOptionen = function () {
        alert("Gespeichert");
        var codeSnippet, htmlCode, ueberschrift;
        if(document.getElementById('checkCodeSnippet').checked == true){
            codeSnippet = true;
        } else {
            codeSnippet = false;
        }
        $http.post('http://localhost:3000/check_options',{
            "codeSnippet" : codeSnippet
        }).then(function(response) { 
            
            console.log(response);
            
        }); 
    }

    /**
     * @description Sucht in Echtzeit nach Eingabe des Users den deutschen Title im internationalen Artikelupload
     * @name searchArticle
     * @summary ALL
     */
    $scope.searchArticle = function () {
        var input, filter, table, tr, td, i;
        input = document.getElementById("myInput");
        filter = input.value.toUpperCase();
        table = document.getElementById("myTable");
        tr = table.getElementsByTagName("tr");
        for (i = 0; i < tr.length; i++) {
            td = tr[i].getElementsByTagName("td")[0];
            if (td) {
                if (td.innerHTML.toUpperCase().indexOf(filter) > -1) {
                    tr[i].style.display = "";
                } else {
                    tr[i].style.display = "none";
                }
            }       
        }
    }

    /**
     * @description Setzt den Kategorienamen für deutschen Artikelupload und gibt Vorschau frei
     * @name setSelected
     * @todo HTML-IDs mit class setzen, damit nicht so viele einzelne IDs angesprochen werden müssen
     * @summary GERMAN
     */
    $scope.setSelected = function() {
        var Kategoriecheckgreen = document.getElementById('Kategoriecheckgreen'); //Text und Icon wenn Kategorie erfolgreich ausgewählt
        var Kategoriecheckred = document.getElementById('Kategoriecheckred'); //Text und Icon wenn Kategorie NICHT erfolgreich ausgewählt
        var vorschaucheckgreen = document.getElementById('vorschaucheckgreen'); //Text und Icon wenn Vorschau verfügbar
        var vorschaucheckred = document.getElementById('vorschaucheckred'); //Text und Icon wenn Vorschau NICHT verfügbar
        var avorschau = document.getElementById('avorschau');
        //Check ob die Kategorie einen uid-Wert hat
        if($scope.item.uid != 0){
            Kategoriecheckgreen.style.display = ''; //Setzt Text und Icon von 'none' auf sichtbar
            Kategoriecheckred.style.display = 'none'; //Setzt Text und Icon von sichtbar auf 'none'
            document.getElementById('katname').innerHTML =  $scope.item.title; //Ausgewählter Kategoriename in HTML hinzufügen
            avorschau.style.visibility = 'visible'; //Setzt Button der Vorschau von 'invisible' auf 'visible'
            avorschau.href=""; //Gibt Button frei, damit klickbar wird
            vorschaucheckgreen.style.display = ''; //Setzt Text und Icon von 'none' auf sichtbar
            vorschaucheckred.style.display = 'none'; //Setzt Text und Icon von sichtbar auf 'none'
        } else {
            Kategoriecheckgreen.style.display = 'none';
            Kategoriecheckred.style.display = '';
        }
    };

    
    /**
     * @description Upload des deutschen Textes zu Typo3
     * @name posten
     * @summary GERMAN
     */
    $scope.posten = function() {
        var pfad = document.getElementById('file').value; //deutscher Dateiname mit Endung
        var respfad = pfad.slice(12); //deutscher Dateiname ohne Endung
        var bestaetigen = confirm(
            "Möchten Sie den Artikel wirklich hochladen?\n\n"
            +"Datei: "+ respfad + "\n\n"
            +"Kategorie: " + $scope.item.title + "\n");
        //Wenn die Confirm-Box bestätigt wird, dann...
        if (bestaetigen == true){
            document.getElementById("loader").style.display = "block"; //Loading-Screen einschalten
            document.getElementById("großerContainer").style.filter = "blur(5px)"; //Applikation hinter dem Loading-Screen mit blur verzerren
            /**
             * @description Upload über Node-Server
             * @name post/upload_typo_german
             * @param $scope.item.uid Kategorie-ID die vom User aus der gelieferten Typo3-Liste ausgewählt wurde
             */
            $http.post('http://localhost:3000/german/upload_typo_german',{
                "KategorieID" : $scope.item.uid
            }).then(function(response) { //Sobald die POST-Methode fertig ist, verschwindet der Loading-Screen und die App wird wieder sichtbar
                document.getElementById("loader").style.display = "none";
                document.getElementById("großerContainer").style.filter = "blur(0px)";
                alert("Status: " + response.data);
                 /**
                 * @description Temporäre Dateien löschen über Node-Server
                 * @name post/loeschen
                 */
                $http.post('http://localhost:3000/loeschen',{
                    "dateiName" : document.getElementById('dokupfad').innerHTML
                });
                //Nachdem die Funktion beendet wurde, lädt die App neu an gleicher STelle an der der User war
                $window.location.reload(); 
            }); 
        } else {
            console.log("Upload abgebrochen");
            $window.location.reload();
        }
    }

  
    /**
     * @description Vorschau des deutschen Artikels in einem neuen Fenster
     * @name vorschau
     * @summary GERMAN
     */
    $scope.vorschau = function(){
        var uploadtypogreen = document.getElementById('uploadtypogreen'); //Text und Icon für Upload bereit
        var uploadtypored = document.getElementById('uploadtypored'); //Text und Icon für Upload NICHT bereit
        uploadtypogreen.style.display = '';
        uploadtypored.style.display = 'none';

        var auploadtypo3 = document.getElementById('auploadtypo3');
        auploadtypo3.style.visibility = 'visible';
        auploadtypo3.href = "";
        /**
        * @description öffnet die Vorschau über Node-Server
        * @name open/vorschau_oeffnen
        */
        $window.open('http://localhost:3000/german/vorschau_oeffnen', '_blank', 'width=50%', );
    }

    /*
        Startfunktion wenn die Seite bzw. die App aufgerufen wird
        Sobald die Seite bereit ist wird ein GET-Request an TYPO3 gesendet um alle Kategorien für deutsche Texte zu erhalten.
    */
    $(document).ready(
        function() {
            console.log("Client gestartet");

            /*
                GET-Request an TYPO3-REST-Api, liefert alle Kategorien unter die deutsche Texte abgelegt werden dürfen
                Liefert 'uid' und 'title' der Kategorien
            */
            $http.get('http://localhost:3000/get_kategorien').then(function(response) {
                $scope.names = response.data;

            });

            $http.get('http://localhost:3000/get_ger_article').then(function(res) {
                $scope.articles  = res.data;
            });

            //Sobald eine Datei im "Deutschen Artikelupload" hochgeladen wird, startet diese Funktion
            $('#file').change(
                function() {
                    console.log("fileGer")
                    var f = document.getElementById('file').files[0]; //Da nur eine Datei ausgewählt werden kann, wird hier immer die erste Datei angesprochen

                    var fd = new FormData(); //Initiale FormData
                    fd.append('file', f); //Hier wird an das erstellte FormData die hochgeladene Datei mit dem Key: 'file' und Value: f (Datei) angehängt
                    
                    /*
                        POST-Methode an Node-Server
                        Schickt die hochgeladene Datei an den Node-Server in Form der FormData
                    */             
                    $http.post('/german/convert_docx_to_html', fd, {
                        transformRequest: angular.identity,
                        headers: {'Content-Type': undefined}
                    }).then(function(response) {
                        if (response.data == "200") {
                            var pfad = document.getElementById('file').value;
                            var respfad = pfad.slice(12);
                            document.getElementById('dokupfad').innerHTML =  respfad;
                            var firstcheckgreen = document.getElementById('firstcheckgreen');
                            var firstcheckred = document.getElementById('firstcheckred');
                            firstcheckgreen.style.display = '';
                            firstcheckred.style.display = 'none';
                            
                            var btnkat = document.getElementById('btnkat');
                            btnkat.style.visibility = 'visible';
                            
                        } else {
                            
                        }
                    });
                    if ($(this).val()) {
                        
                    } else {
                        
                    }
                }
            );

            $('#fileInt').change(
                function() {
                    console.log("fileInt")
                    var f = document.getElementById('fileInt').files[0]; //Da nur eine Datei ausgewählt werden kann, wird hier immer die erste Datei angesprochen

                    var fd = new FormData(); //Initiale FormData
                    fd.append('fileInt', f); //Hier wird an das erstellte FormData die hochgeladene Datei mit dem Key: 'file' und Value: f (Datei) angehängt
                    
                    /*
                        POST-Methode an Node-Server
                        Schickt die hochgeladene Datei an den Node-Server in Form der FormData
                    */             
                    $http.post('/international/convert_docx_to_html_int', fd, {
                        transformRequest: angular.identity,
                        headers: {'Content-Type': undefined}
                    }).then(function(response) {
                        if (response.data == "200") {
                            var pfad = document.getElementById('fileInt').value;
                            var respfad = pfad.slice(12);
                            document.getElementById('dokupfadInt').innerHTML =  respfad;
                            var firstcheckgreen = document.getElementById('firstcheckgreenInt');
                            var firstcheckred = document.getElementById('firstcheckredInt');
                            firstcheckgreen.style.display = '';
                            firstcheckred.style.display = 'none';
                            
                            var btnkat = document.getElementById('btnkatInt');
                            btnkat.style.visibility = 'visible';
                            
                        } else {
                            
                        }
                    });
                    if ($(this).val()) {
                        
                    } else {
                        
                    }
                    
                }
            );
            
            $('input:radio').click(function() {
                
                laenderCode = this.value;
                laenderName = this.id;
                var vorschaucheckgreenInt = document.getElementById('vorschaucheckgreenInt');
            var vorschaucheckredInt = document.getElementById('vorschaucheckredInt');
            var avorschauInt = document.getElementById('avorschauInt');
            avorschauInt.style.visibility = 'visible';
            avorschauInt.href="";
            vorschaucheckgreenInt.style.display = '';
            vorschaucheckredInt.style.display = 'none';

            });
        }
    );
}]);