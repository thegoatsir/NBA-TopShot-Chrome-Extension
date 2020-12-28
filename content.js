playerDict = {}

const url = chrome.runtime.getURL("assets/playerData.json");
fetch(url)
    .then(response => playerDict = response.json())
    .then(json => playerDict = json);

// When page loads, grab the list of players
window.addEventListener("load", () => {
    addPlayerData();
    addLineupData();
});

// When user switches tabs, reload the stuff
window.addEventListener("mouseup", () => {
    addPlayerData();
    addLineupData();
});

// When scrolled, update list with fpts/own
window.addEventListener("scroll", () => {
    addPlayerData();
    addLineupData();
});
window.addEventListener("wheel", () => {
    addPlayerData();
    addLineupData();
});

// Apply data on searches
window.addEventListener("keyup", () => {
    addPlayerData();
    addLineupData();
});

function createPlayerDiv(playerName, shouldBeNA) {
    var fpts_div = document.createElement("div");
    var fpts = shouldBeNA ? 'N/A' : playerDict[playerName]["Fpts"];
    fpts_div.innerHTML = `${fpts}`;
    fpts_div.style.color = "darkslategray";
    fpts_div.style.margin = "auto";
    fpts_div.style.fontSize = "10px";

    var own_div = document.createElement("div");
    var ownership = shouldBeNA ? 'N/A' : playerDict[playerName]["Ownership %"];
    own_div.innerHTML = `${ownership}${ownership == 'N/A' ? '' : '%'}`;
    own_div.style.color = "cornflowerblue";
    own_div.style.margin = "auto";
    own_div.style.fontSize = "10px";

    var both_div = document.createElement("span");
    both_div.appendChild(fpts_div);
    both_div.appendChild(own_div);
    return both_div;
}

function addLineupData() {
    var lineupTable = document.querySelector('[data-test-id="lineup-display"]');
    var lineupPlayers = lineupTable.querySelectorAll('[data-test-id="player-name-cell"]');
    var playersInLineup = []
    lineupPlayers.forEach(playerSpan => {
        var playerName = playerSpan.children[0].getAttribute("title");
        if (playerName != null) {  
            console.log("Lineup player: " + playerName)

            if (playerDict[playerName] != null) {
                var str = `${playerDict[playerName]["Fpts"]}${playerDict[playerName]["Ownership %"]}`;
                console.log(playerSpan.innerText);
                if (playerSpan.innerText != str) {
                    if (Array.from(child.children[1].children[0].children).length == 2) {
                        child.children[1].children[0].removeChild(child.children[1].children[0].children[1]);
                    }
                    playerDict[playerName]["div"] = null;
                }
            }

            var div = playerDict[playerName] == null ? createPlayerDiv('', true )
                                                     : playerDict[playerName]["div"] == null ? createPlayerDiv(playerName) 
                                                                                             : playerDict[playerName]["div"];                                                                                

            if (Array.from(playerSpan.parentElement.children).length == 1) {
                playerSpan.parentElement.appendChild(div);
            }

            if (!playersInLineup.includes(playerName)){
                playersInLineup.push(playerName);
            }
        }
    });
    console.log(playersInLineup);
    buildAwesemoDiv(playersInLineup, lineupTable.parentElement);
}

function addPlayerData() {
    var playerTable = document.getElementsByClassName("ReactVirtualized__Grid__innerScrollContainer")[0];
    var playerSpans = Array.from(playerTable.children);
    playerSpans.forEach(child => {
        var span = child.children[1].children[0].children[0].children[0];
        var playerName = span.getAttribute("Title");

        var div = playerDict[playerName] == null ? createPlayerDiv('', true )
                                                 : playerDict[playerName]["div"] == null ? createPlayerDiv(playerName) 
                                                                                         : playerDict[playerName]["div"];

        if (playerDict[playerName] != null) {
            var str = `${playerDict[playerName]["Fpts"]}${playerDict[playerName]["Ownership %"]}`;
            if (div.innerText != str) {
                if (Array.from(child.children[1].children[0].children).length == 2) {
                    child.children[1].children[0].removeChild(child.children[1].children[0].children[1]);
                }
            }
            playerDict[playerName]["div"] = null;
        }                                                                                
        
        if (Array.from(child.children[1].children[0].children).length == 1) {
            child.children[1].children[0].appendChild(div);
        }
        if (playerDict[playerName] != null) {
            playerDict[playerName]["div"] = div;
        }
    });
}

function buildAwesemoDiv(playersInLineup, parentElement) {
    var fpts = playersInLineup.map(player => +playerDict[player]["Fpts"]).reduce((a, b) => a + b, 0);
    var own = playersInLineup.map(player => +playerDict[player]["Ownership %"]).reduce((a, b) => a + b, 0);
    var boom = playersInLineup.map(player => +playerDict[player]["Boom %"]).reduce((a, b) => a + b, 0);
    var opto = playersInLineup.map(player => +playerDict[player]["Optimal %"]).reduce((a, b) => a + b, 0);

    var current = document.getElementById("awesemo-data");
    if (current != null) {
        // current.remove();
        parentElement.removeChild(current.parentElement);
    }
    if (playersInLineup.length != 0) {
        fetch(chrome.extension.getURL('assets/template.html'))
        .then(response => response.text())
        .then(data => {
            var div = document.createElement("div");
            div.innerHTML = data;
            
            parentElement.appendChild(div);

            console.log(fpts);
            console.log(own);
            console.log(boom);
            console.log(opto);

            var fpts_str = isNaN(fpts) ? 'N/A' : fpts.toFixed(2);
            var own_str = isNaN(own) ? 'N/A' : own.toFixed(1);
            var boom_str = isNaN(boom) ? 'N/A' : boom.toFixed(2);
            var opto_str = isNaN(opto) ? 'N/A' : opto.toFixed(2);

            document.getElementById("awesemo-logo").src = chrome.extension.getURL("assets/awesemo-logo-transparent.png");
            document.getElementById("proj").innerText = `Projection: ${fpts_str}`;
            document.getElementById("own").innerText = `Ownership: ${own_str}%`;
            document.getElementById("boom").innerText = `Boom: ${boom_str}%`;
            document.getElementById("opto").innerText = `Optimal: ${opto_str}%`;
        });
    }
}