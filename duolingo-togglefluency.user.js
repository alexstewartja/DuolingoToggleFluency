// ==UserScript==
// @name         Duolingo: Toggle Fluency Percentage
// @namespace    http://blog.alexstew.com/original/scripts/userscripts/duolingo-toggle-fluency-percentage
// @description  Userscript for Duolingo that allows user to conveniently show/hide their fluency percentage.
// @author       alexstewartja
// @match        https://www.duolingo.com/*
// @copyright    2015, Alex Stewart
// @version     1.0
// @updateURL       https://raw.githubusercontent.com/alexstewartja/DuolingoToggleFluency/master/duolingo-togglefluency.meta.js?duo
// @downloadURL     https://raw.githubusercontent.com/alexstewartja/DuolingoToggleFluency/master/duolingo-togglefluency.user.js?duo
// ==/UserScript==

console.debug('Duolingo: Toggle Fluency Percentage http://blog.alexstew.com/original/scripts/userscripts/duolingo-toggle-fluency-percentage');

var main = initToggleFluency;
var tic_toc; // Timer

// Initialize when Duolingo application loads
function onHomeAdded(mutations) {
    var addedNodes, j, addedElement;
    var i = mutations.length;
    while (i--) {
        addedNodes = mutations[i].addedNodes;
        j = addedNodes.length;
        while (j--) {
            addedElement = addedNodes[j];
            if (addedElement.id === 'app' && addedElement.className === 'home') {
                main();
                onHomeAdded.lastObserver.disconnect();
                onHomeAdded.lastObserver = new MutationObserver(function onHomeChanged(mutations) {
                    var i = mutations.length;
                    while (i--) {
                        if (mutations[i].addedNodes.length) {
                            main();
                            return;
                        }
                    }
                }).observe(addedElement, {childList: true});
                return;
            }
        }
    }
}
onHomeAdded.lastObserver = { // Disconnect safely to prevent erroneous behavior
    disconnect: function() {}
};
new MutationObserver(onHomeAdded).observe(document.body, {childList: true});

if (location.pathname === '/' ) {
    main();
}

// Script injector
function inject(f) {
    var script;
    script = document.createElement('script');
    script.type = 'text/javascript';
    script.textContent = f.toString();
    document.head.appendChild(script);
}


// Yum!
function setCookie(cname, cvalue, exdays) {
    var d = new Date();
    d.setTime(d.getTime() + (exdays*24*60*60*1000));
    var expires = "expires="+d.toUTCString();
    document.cookie = cname + "=" + cvalue + "; " + expires;
}

function getCookie(cname) {
    var name = cname + "=";
    var ca = document.cookie.split(';');
    for(var i=0; i<ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0)==' ') c = c.substring(1);
        if (c.indexOf(name) == 0) return c.substring(name.length,c.length);
    }
    return "";
}

// Set toggle button's icon
function toggleIcon() {
    var mood = getCookie("mood");
    var btn = $("#togglefluency");
    var sad = document.createElement("span");
    var happy = document.createElement("span");

    sad.setAttribute("class", "icon sad-face");
    happy.setAttribute("class", "icon happy-face");

    btn.children().remove();

    return mood == "happy" ? btn.prepend(happy) : btn.prepend(sad);
}

// Toggle away!
function fireToggle(){
    $(".icon.icon-fluency-score").parent().parent().toggle();
    $("#togglefluency").text(function(i, text){
        if(text === "Hide fluency")
        {
            setCookie("fluencyhidden", "yes", 365);
            setCookie("mood", "happy", 365);
        }else{
            if(text==="Show fluency"){
                setCookie("fluencyhidden", "no", 365);
                setCookie("mood", "sad", 365);
            }
        }
        return text === "Hide fluency" ? "Show fluency" : "Hide fluency";
    });
    toggleIcon();
}


// Initialize
function initToggleFluency(){
    // Administer injections. This will only sting a little
    inject(toggleIcon);
    inject(fireToggle);
    inject(getCookie);
    inject(setCookie);
    var fluencyvisible=getCookie("fluencyhidden");

    // Set up custom styles
    custom_style = document.createElement('style');
    custom_style.textContent = "#togglefluency{margin-left:10px}" +
        ".icon.sad-face{width:27px;height:25px;background-position:-301px -54px;background-size:1300px;margin:-6px 8px -3px -6px;}" +
        ".icon.happy-face{width:27px;height:25px;background-position:-359px -54px;background-size:1300px;margin:-6px 8px -3px -6px;}";
    document.head.appendChild(custom_style);

    // Set initial button text
    var btnText ="Hide fluency";
    if (fluencyvisible=="yes") {
        btnText = "Show fluency";
    }

    // Keep current. Stay relevant
    tic_toc = window.setInterval(function(){
        var mainfluencyvisible=getCookie("fluencyhidden");

        if(duo.view === "home"){
            if (mainfluencyvisible=="yes") {
                $(".icon.icon-fluency-score").parent().parent().hide();
                btnText = "Show fluency";
            }else {
                $(".icon.icon-fluency-score").parent().parent().show();
            }
            toggleIcon();
        }
    }, 500);

    // Set up toggle button
    var toggleButton =
        '<button data-tab="toggle_fluency" class="btn btn-standard right store-button btn-store" id="togglefluency" onClick="fireToggle();">'+btnText+'</button>';
    $(".tree").prepend(toggleButton);
}