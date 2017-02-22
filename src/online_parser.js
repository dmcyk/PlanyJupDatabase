// Plany - ZUT Online Parsing Script

var nextTerm = JSON.parse(sessionStorage["nextTerm"] || false);
var isPrevious = JSON.parse(sessionStorage["isPrevious"] || false);
var nextData = sessionStorage["nextData"] || null;
var goBack = JSON.parse(sessionStorage["goBack"] || false);
var validationFlag = JSON.parse(sessionStorage["validation"] || false);
var onlyLoginFlag = JSON.parse(sessionStorage["onlyLogin"] || false);

function browserGoBack() {
    window.history.back();
}

function loadPrevious() {
    var previousButton = document.getElementById("ctl00_ctl00_ContentPlaceHolder_RightContentPlaceHolder_butP");
    previousButton.checked = true;
    previousButton.click();
}

function parseContent(){
    
    var location = window.location.href;

    var userElement = document.getElementsByClassName("who_is_logged_in"); 

    if (userElement.length > 0){
        if (onlyLoginFlag) {
            if (window.webkit.messageHandlers.hasOwnProperty("didFinishLogin")) {
                window.webkit.messageHandlers.didFinishLogin.postMessage("");
            }
            return;
        }
        sessionStorage["validation"] = false;
        window.webkit.messageHandlers.canStartLoading.postMessage("");

        if (location.includes("PodzGodz")) {
            
            if (goBack) {
                sessionStorage["goBack"] = false;
            }

            var term = document.getElementById('ctl00_ctl00_ContentPlaceHolder_RightContentPlaceHolder_rbJak_2');
            var termValue = term.getAttribute('checked');

            if (termValue){
                
                var scheduleTable = document.getElementById("ctl00_ctl00_ContentPlaceHolder_RightContentPlaceHolder_dgDane");
                
                if (scheduleTable) {

                    if (nextTerm) {
                        if (window.webkit.messageHandlers.hasOwnProperty("preprintReport")) {
                            window.webkit.messageHandlers.preprintReport.postMessage(document.documentElement.outerHTML);

                        }
                        
                        if (!isPrevious) {
                            if (scheduleTable.getElementsByTagName("tr").length < 30) {
                                sessionStorage["goBack"] = true;                                
                            }
                            
                        }

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
                        sessionStorage["isPrevious"] = true;
                        loadPrevious();
                        
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
    } else {
        if (location.includes("PodzGodzDruk")){
            if (onlyLoginFlag) {
                return;
            }
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
             // last day
            if (currentElement.hasOwnProperty("date") && currentLessons.length !== 0) {     
                currentElement["lessons"] = currentLessons;
                currentLessons = [];
                collectedElements.push(currentElement);
                currentElement = {};
            }
            
            if (nextData) {
                let next = JSON.parse(nextData);
                for( key in next) {
                    collectedElements.push(next[key]);
                }
                
            }
            let data = JSON.stringify(collectedElements);
            
            if (goBack) {
                sessionStorage["nextData"] = data;
                sessionStorage["isPrevious"] = true;
                browserGoBack();
                return; 
            }
            
            if (window.webkit.messageHandlers.hasOwnProperty("passDataMessageAndReport")) {
                var prepare = {
                    "raw": document.documentElement.outerHTML,
                    "data": data
                };
                var str = JSON.stringify(prepare);
                window.webkit.messageHandlers.passDataMessageAndReport.postMessage(str);
            } else {
                window.webkit.messageHandlers.passDataMessage.postMessage(data);
            }

        } else {
            if (validationFlag) {
                let loginRes = document.getElementById("ctl00_ctl00_ContentPlaceHolder_MiddleContentPlaceHolder_lblMessage");
                var message = null;
                if (loginRes) {
                    if (window.getComputedStyle(loginRes).display !== "none") {
                        message = "failed";
                    }
                } else {
                    message = "error";
                }
                if (window.webkit.messageHandlers.hasOwnProperty("loginFailure")) {
                    window.webkit.messageHandlers.loginFailure.postMessage(message);
                }
            }
        }
    }

}
function online_loginUser(login, password, onlyLogin) {
    // try login fields 
    let loginInput = document.getElementById("ctl00_ctl00_ContentPlaceHolder_MiddleContentPlaceHolder_txtIdent");
    let passInput =  document.getElementById("ctl00_ctl00_ContentPlaceHolder_MiddleContentPlaceHolder_txtHaslo");
    let loginBtn = document.getElementById("ctl00_ctl00_ContentPlaceHolder_MiddleContentPlaceHolder_butLoguj");
    if (loginInput && passInput && loginBtn) {
        loginInput.value = login;
        passInput.value = password;
        sessionStorage["validation"] = true;
        loginBtn.click();
    }
    sessionStorage["onlyLogin"] = onlyLogin === 0 ? false : true;
}
window.onload = function(){
    parseContent();
}
