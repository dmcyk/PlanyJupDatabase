// Plany - ZUT Online Parsing Script

var nextTerm = sessionStorage["nextTerm"] || false;
function parseContent(){
    var location = window.location.href;

    var user = document.getElementsByClassName("who_is_logged_in")[0];

    if (user != null){
        window.webkit.messageHandlers.canStartLoading.postMessage("");

        if (location.includes("PodzGodz")) {

            var term = document.getElementById('ctl00_ctl00_ContentPlaceHolder_RightContentPlaceHolder_rbJak_2');
            var termValue = term.getAttribute('checked');

            if (termValue){
                
                var scheduleTable = document.getElementById("ctl00_ctl00_ContentPlaceHolder_RightContentPlaceHolder_dgDane");
                
                if (scheduleTable) {

                    
                    if (nextTerm) {
                        var printButton = document.getElementById('ctl00_ctl00_ContentPlaceHolder_RightContentPlaceHolder_btDrukuj');
                        var click = printButton.getAttribute('onclick');
                        var beginLocationIndex = click.indexOf('\'');
                        var endLocationIndex = click.lastIndexOf('\'');
                        var printUrl = click.substring(beginLocationIndex + 1,endLocationIndex);
                        window.location.href = printUrl;
                        
                    } else {

                        sessionStorage["nextTerm"] = true;
                        var nextButton = document.getElementById("ctl00_ctl00_ContentPlaceHolder_RightContentPlaceHolder_butN");
                        nextButton.checked = true; 
                        nextButton.click();
                    }
                    
                    
                } else {

                    if (nextTerm) {
                        var previousButton = document.getElementById("ctl00_ctl00_ContentPlaceHolder_RightContentPlaceHolder_butP");
                        previousButton.checked = true;
                        previousButton.click();
                    } else {
                        window.webkit.messageHandlers.noData.postMessage("");
                    }
                }
            }else {

                term.checked = true;
                term.onclick();

            }
        }else {
                window.location.href = 'https://edziekanat.zut.edu.pl/WU/PodzGodzin.aspx';
        }
    }else {

        if (location.includes("PodzGodzDruk")){

            var table = document.getElementsByTagName("table")[0];
            var tbody = table.getElementsByTagName("tbody")[0];
            var rows = tbody.getElementsByTagName("tr");
            rows[0].remove();
            var currentElement = {};
            var currentLessons = [];
            var collectedElements = [];
            for(var i = 0; i < rows.length; i++) {
                var currentRow = rows[i];
                var ths = currentRow.getElementsByTagName("th");
                if (ths.length > 0) {
                    if (currentElement.hasOwnProperty("date")) {
                        
                        currentElement["lessons"] = currentLessons;
                        currentLessons = [];
                        collectedElements.push(currentElement);
                        currentElement = {};
                    }
                    var th = ths[0];
                    var keyValues = th.textContent.split(",");
                    keyValues = keyValues.map(function (element) {
                                              return element.trim();
                                              });
                    if (keyValues.length === 2) {
                        currentElement["date"] = keyValues[0];
                        currentElement["dayName"] = keyValues[1];
                    }
                } else {
                    if (currentElement.hasOwnProperty("date")) {
                        var tds = [].slice.call(currentRow.getElementsByTagName("td"));
                        var currentLesson = {};
                        tds.forEach(function (element, index) {
                                    var content = element.textContent;
                                    switch (index) {
                                    case 2:
                                    currentLesson["fromHour"] = content; break;
                                    case 3:
                                    currentLesson["tillHour"] = content; break;
                                    case 4:
                                    currentLesson["subject"] = content; break;
                                    case 5:
                                    currentLesson["teacher"] = content; break;
                                    case 6:
                                    currentLesson["classroom"] = content; break;
                                    case 8:
                                    currentLesson["type"] = content; break;
                                    default:
                                    break;

                                    }
                                    });
                        currentLessons.push(currentLesson);
                        
                    }
                    
                }
            }
            var str = JSON.stringify(collectedElements);
            window.webkit.messageHandlers.passDataMessage.postMessage(str);

        }
    }

}

window.onload = function(){
    parseContent();
}
