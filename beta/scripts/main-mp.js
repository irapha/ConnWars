var planets = {}; //on firebase
var planetIds = []; //on firebase
var selectedPlanets = [];
var selectedPlanetsAI = [];
var connectedPlanets = []; //on firebase
var connectionIds = []; //on firebase
var planetsPerSide = 10;
var viewport = $('#viewport');
var levelWidth = viewport.width(); //on firebase
var levelHeight = viewport.height(); //on firebase
var selectedPlanet;
var bluePlanets = []; //on firebase
var redPlanets = []; //on firebase
var starterPlanetSelected = 0;
var isPaused = false;
var inDebug = false;
var isPlayerOne = false;

var firebase = new Firebase("https://connwars.firebaseio.com/");

function displayMessage(msg) {
  $("#startmenu").show();
  $("#settlemsg").show();
  $("#settlemsg").text(msg);
}

var playerId;

function assignId() {
  var playerList = firebase.child("playerList");
  var playerInList = playerList.push();
  playerInList.set({ "width": levelWidth, "height": levelHeight });
  playerInList.onDisconnect().remove();
  playerId = playerInList.name();
}

var gamesRef = firebase.child("games");
var gameRef;

function findGame() {
  displayMessage("Looking for an open game.");

  //consider changing this to a "transaction". Might be better with multiple players trying to connect
  gamesRef.once("value", function(snapshot) {
    //this was not running properly after findinganothergame, because Firebase.goOnline() takes a while...

    if(!snapshot.val()) {
      //no games. create our own
      createGame();
      return;
    }

    var foundGame = false;
    for (var gameId in snapshot.val()) {
      var gameObj = snapshot.val()[gameId];
      //check if game has only one player
      if(gameObj.player1 && !gameObj.player2) {
        foundGame = true;
        //add ourselves to this game and start it
        enterGame(gamesRef.child(gameId), gameObj.player1);
        break;
      }
    }

    if(!foundGame) {
      //no empty games found, create our own and wait for it.
      createGame();
    }
  });
}

function enterGame(game, hostId) {
  isPlayerOne = false;
  gameRef = game;
  gameRef.child("player2").set(playerId);

  displayMessage("Game found. Now entering match.");

  gameRef.onDisconnect().remove();
  setViewportListener();
  setUpViewport();
  listenForDisconnect(hostId);
}

function createGame() {
  isPlayerOne = true;
  gameRef = gamesRef.push({
                  "player1": playerId,
                  "player2": null,
                  "initialWidth": levelWidth,
                  "initialHeight": levelHeight,
                  "height": null,
                  "width": null,
                  "starterPlanetSelected": null,
                  "connectionIds": [],
                  "connectedPlanets": [],
                  "doneSettingUp": null
              });

  displayMessage("Creating a match");

  gameRef.onDisconnect().remove();
  setViewportListener();
  waitForPlayer2();
}

function setViewportListener() {

  displayMessage("Setting up.");

  var heightModified = false;
  var widthModified = false;

  gameRef.child("height").on("value", function(snapshot) {
    if (snapshot.val() === null) {
      return;
    }

    levelHeight = snapshot.val();
    viewport.css("height", levelHeight);
    heightModified = true;
    callPlanetListeners();
  });

  gameRef.child("width").on("value", function(snapshot) {
    if (snapshot.val() === null) {
      return;
    }

    levelWidth = snapshot.val();
    viewport.css("width", levelWidth);
    widthModified = true;
    callPlanetListeners();
  });

  function callPlanetListeners() {
    if (!heightModified || !widthModified) {
      return;
    }
    setUpPlanetListeners();
  }
}

function setUpPlanetListeners() {
  displayMessage("Looking for an open game.");

  gameRef.child("planetIds").on("value", function (snapshot) {
    planetIds = [];

    for (var key in snapshot.val()) {
      var planet = snapshot.val()[key];
      planetIds.push(planet);
    }
  });

  gameRef.child("planets").on("child_added", function(snapshot) {
    var planetId = snapshot.name();
    planets[planetId] = snapshot.val();

    viewport.append('<div class="planet grey" id="'+planetId+'" align="center"><div class="population-wrapper"></div><div class="pie-wrapper"><div class="pie pie-spinner-blue"></div><div class="pie pie-filler-blue"></div><div class="pie-mask-blue"></div><div class="pie pie-spinner-red"></div><div class="pie pie-filler-red"></div><div class="pie-mask-red"></div></div></div>');
    drawPlanet(planetId);

    gameRef.child("planets/" + planetId).on("child_changed", function(snapshot) {
      var planetModifiedId = snapshot.ref().parent().name();
      var value = snapshot.val();
      var key = snapshot.name();

      if(!isPlayerOne) {
        if (value === "red") {
          value = "blue";
        } else if (value === "blue") {
          value = "red";
        }
      }

      planets[planetModifiedId][key] = value;

      if (key === "classColor") {
        $("#"+planetModifiedId).removeClass("grey");
        $("#"+planetModifiedId).removeClass("blue");
        $("#"+planetModifiedId).removeClass("red");
        $("#"+planetModifiedId).addClass(value);
      }

      if (key === "inChaosClass") {
        if(value) {
          $("#"+planetModifiedId).addClass("chaos");
        } else {
          $("#"+planetModifiedId).removeClass("chaos");
        }
      }
    });
  });

  gameRef.child("connectionIds").on("value", function(snapshot) {
    var values = snapshot.val();

    var result = [];
    for (var key in values) {
      result.push(values[key]);
    }

    connectionIds = result;
  });

  gameRef.child("connectedPlanets").on("value", function(snapshot) {
    var values = snapshot.val();

    var result = [];
    for (var key in values) {
      result.push(values[key]);
    }

    connectedPlanets = result;
  });

  // gameRef.child("connectionIds").on("child_added", function(snapshot) {
  //   connectionIds.push(snapshot.val());
  // });
  //
  // gameRef.child("connectionIds").on("child_removed", function(snapshot) {
  //   for (var i = 0; i < connectionIds.length; i++) {
  //     if (connectionIds[i] === snapshot.val()) {
  //       connectionIds.splice(i, 1);
  //       break;
  //     }
  //   }
  // });
  //
  // gameRef.child("connectedPlanets").on("child_added", function(snapshot) {
  //   connectedPlanets.push(snapshot.val());
  // });
  //
  // gameRef.child("connectedPlanets").on("child_removed", function(snapshot) {
  //   for (var i = 0; i < connectedPlanets.length; i++) {
  //     if (connectedPlanets[i].toPlanet === snapshot.val().toPlanet
  //         && connectedPlanets[i].fromPlanet === snapshot.val().fromPlanet) {
  //       connectedPlanets.splice(i, 1);
  //       break;
  //     }
  //   }
  // });

  if (isPlayerOne) {
    setupLevel(); // only for playerOne
  } else {
    waitForPlanets(); // only for playerTwo.
  }
}

function waitForPlanets() {
  if (!numberOfTries || numberOfTries === undefined) {
    var numberOfTries = 0;
  }

  displayMessage("Waiting for game information.");

  gameRef.child("doneSettingUp").on("value", function(snapshot) {
    if(snapshot.val() === null) {
      return;
    }

    requestStarterPlanet();
  });
}

function waitForPlayer2() {
  displayMessage("Waiting for another player.");

  //wait for player2 to enter game
  gameRef.child("player2").on("value", function(snapshot) {
    if (!snapshot.val()) {
      return;
    }

    if (snapshot.val() !== undefined) {
      var player2 = snapshot.val();
      listenForDisconnect(player2);
    }
  });
}

function listenForDisconnect(playerId) {
  firebase.child("playerList/" + playerId).on("child_removed", function(snapshot) {

    displayMessage("Player 2 disconnected.");

    //this is here so we only run the function once
    if(snapshot.name() === "height") {
        findAnotherGame();
      }
  });
}

function setUpViewport() {
  displayMessage("Setting up.");

  gameRef.once("value", function(snapshot) {
    var gameObj = snapshot.val();

    levelHeight = (viewport.height() < gameObj.initialHeight) ? viewport.height() : gameObj.initialHeight;
    levelWidth = (viewport.width() < gameObj.initialWidth) ? viewport.width() : gameObj.initialWidth;

    gameRef.child("height").set(levelHeight);
    gameRef.child("width").set(levelWidth);

    gameRef.child("initialHeight").remove();
    gameRef.child("initialWidth").remove();
  });
}

function findAnotherGame() {
  displayMessage("Looking for another game.");

  gameRef.remove();
  clearClickEvents();

  starterPlanetSelected = 0;
  planets = {}; //on firebase
  planetIds = []; //on firebase
  selectedPlanets = [];
  selectedPlanetsAI = [];
  connectedPlanets = []; //on firebase
  connectionIds = [];
  selectedPlanet = null;
  viewport.html("");

  gameStarted = false;
  firebase.remove(function() {
    //these need to go away. They are messing up re-matchmaking
    // Firebase.goOnline();
    // Firebase.goOffline();
    assignId();
    setTimeout(findGame(), 1000);
  });
}

function setupLevel() {
  displayMessage("Setting up.");

  var cellWidth = levelWidth/10;
  var cellHeight = levelHeight/10;
  var currentId = 0;
  var offLimits = [44, 45, 50, 51]; // center four on 10x10 grid
  var allowedCells = [];
  for(var i=0; i<100; i++) {
    if(offLimits.indexOf(i) === -1)
      allowedCells.push(i);
  }
  for(var i=0; i<planetsPerSide; i++) {
    if(allowedCells.length === 0) {
      continue;
    }
    var randomCellIndex = allowedCells[~~(Math.random()*allowedCells.length)];
    var cellCoords = indexToCoords(randomCellIndex);
    var invertedCoords = {x:9-cellCoords.x, y:9-cellCoords.y};
    var invertedIndex = coordsToIndex(invertedCoords);
    allowedCells.splice(allowedCells.indexOf(randomCellIndex), 1);
    allowedCells.splice(allowedCells.indexOf(invertedIndex), 1);
    removeAdjacentIndices(randomCellIndex);
    removeAdjacentIndices(invertedIndex);
    var xAdjustment = ~~(Math.random()*cellWidth/4-cellWidth/8);
    var yAdjustment = ~~(Math.random()*cellHeight/4-cellHeight/8);
    cellCoords.x *= cellWidth;
    cellCoords.y *= cellHeight;
    cellCoords.x += cellWidth/2 + xAdjustment;
    cellCoords.y += cellHeight/2 + yAdjustment;
    invertedCoords.x *= cellWidth;
    invertedCoords.y *= cellHeight;
    invertedCoords.x += cellWidth/2 - xAdjustment;
    invertedCoords.y += cellHeight/2 - yAdjustment;

    var planetId = 'planet' + currentId;
    gameRef.child("planetIds").push(planetId);
    gameRef.child("planets").child(planetId).set({color:'grey', x:cellCoords.x, y:cellCoords.y, id:planetId,
      selected:false, population:0, selectedAI:false, inChaos:false, inChaosClass:false, classColor:"grey"});
    currentId++;

    planetId = 'planet' + currentId;
    gameRef.child("planetIds").push(planetId);
    gameRef.child("planets").child(planetId).set({color:'grey', x:invertedCoords.x, y:invertedCoords.y, id:planetId,
      selected:false, population:0, selectedAI:false, inChaos:false, inChaosClass:false, classColor:"grey"});
    currentId++;
  }

  function indexToCoords(index) {
    var coords = {};
    coords.x = index%10;
    coords.y = ~~(index/10);
    return coords;
  }
  function coordsToIndex(coords) {
    var index = coords.y*10;
    index += coords.x;
    return index;
  }
  function removeAdjacentIndices(index) {
    var coords = indexToCoords(index);
    var adjacent = [
      {x:coords.x+1, y:coords.y},
      {x:coords.x+1, y:coords.y+1},
      {x:coords.x+1, y:coords.y-1},
      {x:coords.x-1, y:coords.y},
      {x:coords.x-1, y:coords.y+1},
      {x:coords.x-1, y:coords.y-1},
      {x:coords.x, y:coords.y+1},
      {x:coords.x, y:coords.y-1}
    ];
    adjacent.forEach(function(adjCoords) {
      if(adjCoords.x<=10 && adjCoords.x>=0 && adjCoords.y<=10 && adjCoords.y>=0) {
        var adjIndex = coordsToIndex(adjCoords);
        var allowedIndex = allowedCells.indexOf(adjIndex);
        if(allowedIndex !== -1) {
          allowedCells.splice(allowedIndex, 1);
        }
      }
    });
  }

  gameRef.child("doneSettingUp").set(true);

  requestStarterPlanet();
}

function setClickEvents() {
  $(".planet").click(function(event) {
    event.stopPropagation();
    planetClicked($(this), false);
  });

  $("body").click(function() {
    if(selectedPlanets.length > 0) {
      $('#'+selectedPlanets[0]).toggleClass('selected');
      planets[selectedPlanets[0]].selected = !planets[selectedPlanets[0]].selected;

      if(selectedPlanets > 1) {
          $('#'+selectedPlanets[1]).toggleClass('selected');
          planets[selectedPlanets[1]].selected = !planets[selectedPlanets[1]].selected;
      }

      selectedPlanets = [];
    }
  });

  $("#endmenu").hide();
}

function clearClickEvents() {
  $(".planet").unbind();
  $("body").unbind();
}

function initialDraw() {
  planetIds.forEach(function(planetId) {
    var planet = planets[planetId];
    var planetEl = $("#"+planetId);
    planetEl.css("left", planet.x-15);
    planetEl.css("top", planet.y-15);
  });
}

function drawPlanet(planetId) {
  var planet = planets[planetId];
  var planetEl = $("#"+planetId);
  planetEl.css("left", planet.x-15);
  planetEl.css("top", planet.y-15);
}

function getPlanetDistance(planetOneId, planetTwoId) {
  planetOnex = planets[planetOneId].x;
  planetOney = planets[planetOneId].y;
  planetTwox = planets[planetTwoId].x;
  planetTwoy = planets[planetTwoId].y;

  deltaY = planetTwoy - planetOney;
  deltaX = planetTwox - planetOnex;

  deltaY *= deltaY;
  deltaX *= deltaX;
  distance = Math.sqrt(deltaX + deltaY);

  return distance;
}

function deleteConnection(connectionId) {
  gameRef.child("connectedPlanets/" + connectionId).remove();
  gameRef.child("connectionIds/" + connectionId).remove();
}

function createConnection(connectionId, from, to) {
  gameRef.child("connectedPlanets/" + connectionId).set({"from": from, "to": to});
  gameRef.child("connectionIds/" + connectionId).set(connectionId);
}

function planetClicked(planetEl, isAI) {
  //isAI = typeof isAI === undefined ? (false) : (true);
  if(isAI) {
    var userColor = "red";
  }else {
    var userColor = "blue";
    //isAI = false;
  }

  var planetId = planetEl.attr("id");
  var planet = planets[planetId];

  //delete connections from the selected planet, if they exist,
  //and if this planet belongs to the player/AI
  if(planet.color === userColor) {
    for(var i = 0; i < connectedPlanets.length; i++) {
      if(connectedPlanets[i].from === planetId) {
        if((selectedPlanets.length === 0)) {

          connectionId = planetId + connectedPlanets[i].to;
          receiver = planets[connectedPlanets[i].to];

          deleteConnection(connectionId);

          $("#"+connectionId+"One").remove();
          $("#"+connectionId+"Two").remove();

          if(receiver.population < 1) {
            //TODO: might be causing another bug...
            //fixes bug #14
            gameRef.child("planets/" + receiver.id + "/classColor").set("grey");
            gameRef.child("planets/" + receiver.id + "/color").set("grey");
            gameRef.child("planets/" + receiver.id + "/population").set(0);
          }
        }
      }
    }
  }

  if(selectedPlanets.length === 0 && planet.inChaos === false) {
    if(planet.color === userColor) {
      planet.selected = !planet.selected;
      planetEl.toggleClass('selected');
      selectedPlanets.push(planetId);
    }
  }else if(selectedPlanets.length === 1) {
    if(selectedPlanets[0] === planetId){
      planet.selected = !planet.selected;
      planetEl.toggleClass('selected');
      selectedPlanets = [];
    }else {
      if(planets[selectedPlanets[0]].color !== userColor) {
        unselect = planets[selectedPlanets[0]];
        unselect.selected = !unselect.selected;
        $("#"+unselect.id).toggleClass('selected');
        selectedPlanets = [];
        delete isAI;
        return;
      }

      //make connection between the two planets
      connectionId = selectedPlanets[0] + planetId;

      createConnection(connectionId, selectedPlanets[0], planetId);

      //deselect planets
      $('#'+selectedPlanets[0]).toggleClass('selected');
      planets[selectedPlanets[0]].selected = !planets[selectedPlanets[0]].selected;
      planet.selected = !planet.selected;
      //draw connection
      giverColor = planets[selectedPlanets[0]].color;

      planetDistance = getPlanetDistance(selectedPlanets[0], planetId);
      viewport.append('<div class="connection '+giverColor+' left" id="'+connectionId+'One"></div>');
      viewport.append('<div class="connection '+giverColor+' right" id="'+connectionId+'Two"></div>');
      connectionElOne = $("#"+connectionId+"One");
      connectionElTwo = $("#"+connectionId+"Two");
      connectionElOne.css("width", planetDistance);
      connectionElTwo.css("width", planetDistance);

      planetOnex = planets[selectedPlanets[0]].x;
      planetOney = planets[selectedPlanets[0]].y;
      planetTwox = planets[planetId].x;
      planetTwoy = planets[planetId].y;
      deltaY = planetTwoy - planetOney;
      deltaX = planetTwox - planetOnex;
      angle = Math.atan2(deltaY, deltaX);

      connectionElOne.css('left', planetOnex);
      connectionElOne.css('top', planetOney - 5);
      connectionElTwo.css('left', planetOnex);
      connectionElTwo.css('top', planetOney);

      connectionElOne.css("transform", "rotate("+angle+"rad)");
      connectionElTwo.css("transform", "rotate("+angle+"rad)");

      //finish deselecting planets
      selectedPlanets = [];
    }
  }else if(selectedPlanets.length > 2) {
    //this will only run if, for some reason,
    //a bug happened and two planets remained selected.

    //deselects other selected planets
    $('#'+selectedPlanets[0]).toggleClass('selected');
    planets[selectedPlanets[0]].selected = !planets[selectedPlanets[0]].selected;

    $('#'+selectedPlanets[1]).toggleClass('selected');
    planets[selectedPlanets[1]].selected = !planets[selectedPlanets[1]].selected;

    selectedPlanets = [];
    //select current planet
    selectedPlanets.push(planetId);
    planetEl.toggleClass('selected');

  }
}

var playerOnePickedStarterPlanet = false;

function requestStarterPlanet(){

  displayMessage("Select a starter planet and wait for the game to start.");

  setClickEvents();

  $(".planet").click(function() {
    if(starterPlanetSelected === 1 || playerOnePickedStarterPlanet){
      return;
    };

    var planetId = $(this).attr("id");
    var planet = planets[planetId];

    if (planet.color !== "grey") {
      return;
    }

    gameRef.child("planets/"+planetId+"/population").set(100);
    var starterPlanetColor = (isPlayerOne) ? ("blue") : ("red");
    gameRef.child("planets/"+planetId+"/color").set(starterPlanetColor);
    gameRef.child("planets/"+planetId+"/classColor").set(starterPlanetColor);

    //both starter planets have to be selected for the game to run.
    if (isPlayerOne) {
        playerOnePickedStarterPlanet = true;
        gameRef.child("starterPlanetSelected").once("value", function(snapshot) {

            if(!snapshot.val() || snapshot.val() === null || snapshot.val() === undefined) {

              gameRef.child("starterPlanetSelected").on("value", function(snap) {
                if (snap.val() === true) {
                  if (starterPlanetSelected === 1) {
                    return;
                  }
                  starterPlanetSelected = 1; //now the game loop will run
                  gameStarted = true;
                  startGame();
                }
              });

            } else if (snapshot.val() === true) {
              starterPlanetSelected = 1; //now the game loop will run
              gameStarted = true;
              startGame();
            }
        });

    } else {
        gameRef.child("starterPlanetSelected").set(true);
        starterPlanetSelected = 1;
        gameStarted = true;
        startGame();
    }

    $("#startmenu").hide();
  });
}

function updatePopulations() {
  var firebaseUpdates = {};

  for(var i = 0; i < connectedPlanets.length; i++) {
    giver = planets[connectedPlanets[i].from];
    receiver = planets[connectedPlanets[i].to];

    if (firebaseUpdates[giver.id] === undefined || firebaseUpdates[giver.id].population === undefined) {
      newPops = getPlanetPopulations(giver, receiver);
    } else {
      newPops = getPlanetPopulations(giver, receiver, firebaseUpdates[giver.id].population);
    }

    newPops_zero = ~~newPops[0];
    newPops_one = ~~newPops[1];

    var oldGiverColor = (firebaseUpdates[giver.id] === undefined || firebaseUpdates[giver.id].color === undefined) ? giver.color : firebaseUpdates[giver.id].color;

    //if new population is zero, change color to grey
    if(newPops_zero <= 0) {
      if (firebaseUpdates[giver.id] === undefined) { firebaseUpdates[giver.id] = {}; }
      // gameRef.child("planets/" + giver.id + "/classColor").set("grey");
      firebaseUpdates[giver.id].classColor = "grey";
    }

    if(newPops[0] <= 0) {
      newPops[0] = 0;
      if (firebaseUpdates[giver.id] === undefined) { firebaseUpdates[giver.id] = {}; }
      // gameRef.child("planets/" + giver.id + "/classColor").set("grey");
      firebaseUpdates[giver.id].classColor = "grey";
      // gameRef.child("planets/" + giver.id + "/color").set("grey");
      firebaseUpdates[giver.id].color = "grey";

      //delete connection this planet has with others
      for(var i = 0; i < connectedPlanets.length; i++) {
        if(connectedPlanets[i].from === giver.id) {
          connectionId = giver.id + connectedPlanets[i].to;

          deleteConnection(connectionId);

          $("#"+connectionId+"One").remove();
          $("#"+connectionId+"Two").remove();
        }
      }
    }
    if (firebaseUpdates[giver.id] === undefined) { firebaseUpdates[giver.id] = {}; }
    // gameRef.child("planets/" + giver.id + "/population").set(newPops[0]);
    firebaseUpdates[giver.id].population = newPops[0];

    //TODO: figure out a way to make the next if vvv take this update ^^^ into account
    //because it's not as simple as seeting it in firebase:
    //what if the giver Id and receiver Id are the same for some combination of connections?
    //that means that, when we set receiver id's population down here VVV,
    //we will erase the changes we just made up here ^^^

    var receiverColor = (firebaseUpdates[receiver.id] === undefined || firebaseUpdates[receiver.id].color === undefined) ? receiver.color : firebaseUpdates[receiver.id].color ;
    var receiverPopulation = (firebaseUpdates[receiver.id] === undefined || firebaseUpdates[receiver.id].population === undefined) ? receiver.population : firebaseUpdates[receiver.id].population;
    //if new population is negative, change color to oposite
    if(newPops[1] < 0) {
      newPops[1] = (-1)*newPops[1];

      if(receiverColor === "red") {
        var newColor = "blue";
      }else if(receiver.color === "blue") {
        var newColor = "red";
      }

      if (firebaseUpdates[receiver.id] === undefined) { firebaseUpdates[receiver.id] = {}; }
      // gameRef.child("planets/" + receiver.id + "/classColor").set(newColor);
      firebaseUpdates[receiver.id].classColor = newColor;
      // gameRef.child("planets/" + receiver.id + "/color").set(newColor);
      firebaseUpdates[receiver.id].color = newColor;

      //delete all connections from receiver.
      for(var i = 0; i < connectedPlanets.length; i++) {
        if(connectedPlanets[i].from === receiver.id) {
          connectionId = receiver.id + connectedPlanets[i].to;

          deleteConnection(connectionId);

          $("#"+connectionId+"One").remove();
          $("#"+connectionId+"Two").remove();
        }
      }
    }

    if(receiverPopulation === 0) {

      if (firebaseUpdates[giver.id] === undefined || firebaseUpdates[giver.id].color === undefined) {
        giverColor = giver.color;
      } else {
        giverColor = giver.color = firebaseUpdates[giver.id].color
      }

      if(oldGiverColor === giverColor) {

        if (firebaseUpdates[receiver.id] === undefined) { firebaseUpdates[receiver.id] = {}; }
        // gameRef.child("planets/" + receiver.id + "/classColor").set(oldGiverColor);
        firebaseUpdates[receiver.id].classColor = oldGiverColor;
        // gameRef.child("planets/" + receiver.id + "/color").set(oldGiverColor);
        firebaseUpdates[receiver.id].color = oldGiverColor;

        //check if, by mistake, this planet has active connections.
        for(var i = 0; i < connectedPlanets.length; i++) {
          if(connectedPlanets[i].from === receiver.id) {
            connectionId = receiver.id + connectedPlanets[i].to;

            deleteConnection(connectionId);

            if($("#"+connectionId+"One").length !== 0) {
              $("#"+connectionId+"One").remove();
              $("#"+connectionId+"Two").remove();
            }
          }
        }
      }else {
        if(receiverColor === "grey") {
          newPops[1] = 0;
        }
      }
    }
    if (firebaseUpdates[receiver.id] === undefined) { firebaseUpdates[receiver.id] = {}; }
    // gameRef.child("planets/" + receiver.id + "/population").set(newPops[1]);
    firebaseUpdates[receiver.id].population = newPops[1];
  }

  for(var i = 0; i < planetIds.length; i++) {
    planet = planets[planetIds[i]];

    var planetPopulation = (firebaseUpdates[planet.id] === undefined || firebaseUpdates[planet.id].population === undefined) ? planet.population : firebaseUpdates[planet.id].population ;

    if(planetPopulation > 2) {
        // gameRef.child("planets/" + planet.id + "/population").set(getNaturalGrowth(planetIds[i]));

        if (firebaseUpdates[planet.id] === undefined || firebaseUpdates[planet.id].population === undefined) {
          planetPopulation = getNaturalGrowth(planet.id);
        } else {
          planetPopulation = getNaturalGrowth(planet.id, firebaseUpdates[planet.id].population);
        }

        if (firebaseUpdates[planet.id] === undefined) { firebaseUpdates[planet.id] = {}; }
        firebaseUpdates[planet.id].population = planetPopulation;

        //check for chaos
        if(planetPopulation === 1000) {
          if (firebaseUpdates[planet.id] === undefined) { firebaseUpdates[planet.id] = {}; }
          // gameRef.child("planets/" + planet.id + "/inChaos").set(true);
          firebaseUpdates[planet.id].inChaos = true;
          // gameRef.child("planets/" + planet.id + "/isnChaosClass").set(true);
          firebaseUpdates[planet.id].inChaosClass = true;

          //delete all connections TO this planet, coming from planets of the same color
          for(var j = 0; j < connectedPlanets.length; j++) {
            if(connectedPlanets[j].to === planet.id) {
              if(planets[connectedPlanets[j].to].color === planets[connectedPlanets[j].from].color) {
                connectionId = connectedPlanets[j].from + connectedPlanets[j].to;

                deleteConnection(connectionId);

                var connExists = $("#"+connectionId+"One");
                if(connExists.length !== 0) {
                  //connection is visible. undraw
                  $("#"+connectionId+"One").remove();
                  $("#"+connectionId+"Two").remove();
                }
              }
            }
          }
        }else if(planet.inChaos === true && planet.population <= 500) {
          if (firebaseUpdates[planet.id] === undefined) { firebaseUpdates[planet.id] = {}; }
          // gameRef.child("planets/" + planet.id + "/inChaos").set(false);
          firebaseUpdates[planet.id].inChaos = false;
          // gameRef.child("planets/" + planet.id + "/inChaosClass").set(false);
          firebaseUpdates[planet.id].inChaosClass = false;
        }
    }
  }

  //This is where the magic happens.
  gameRef.child("planets").update(firebaseUpdates);
}

function updatePlanetScales() {
  for(var i = 0; i < planetIds.length; i++) {
    planet = planets[planetIds[i]];
    planetPop = planet.population;
    if(planetPop > 0) {
      var planetScale = (Math.pow(planet.population, 1/2)/15.8) + 1;
    }else {
      var planetScale = 1;
    }
    //change planet size
    $("#"+planet.id).css("transform", "scale("+planetScale+", "+planetScale+")")
  }
}

function writePlanetPopulations() {
  for(var i = 0; i < planetIds.length; i++) {
    planet = planets[planetIds[i]];
    planetPop = ~~planet.population;
    planetId = planet.id;

    // to make red planets' pops visible, remove this comparison from the loop
    // planet.color === "blue"
    if(planetPop > 1) {
      if(inDebug) {                                                             //DEBUG
        $("#"+planetId).find('.population-wrapper').html(planetPop); //in debug mode, this happens for all planets
      }else {
        if(planet.color === "blue") {
          $("#"+planetId).find('.population-wrapper').html(planetPop);
        }
      }
    }else if(planetPop === 0 || planetPop === 1 || planet.color === "red") {
      $("#"+planetId).find('.population-wrapper').html("");
    }
  }
}

function updateAIConnectionsVisibility() {
  for(var i = 0; i < planetIds.length; i++) {
    planet = planets[planetIds[i]];
    planetId = planet.id;

    if(planet.color === "blue") {
      for(var j = 0; j < connectedPlanets.length; j++) {
        if(connectedPlanets[j].to === planetId
              && planets[connectedPlanets[j].from].color === "red") {
          giverId = connectedPlanets[j].from;
          giverColor = planets[giverId].color;
          connectionId = connectedPlanets[j].from + planetId;
          //check if connection is visible.
          var connExists = $("#"+connectionId+"One");
          if(connExists.length === 0) {
            //connection is invisible. draw
            planetDistance = getPlanetDistance(giverId, planetId);
            viewport.append('<div class="connection '+giverColor+' left" id="'+connectionId+'One"></div>');
            viewport.append('<div class="connection '+giverColor+' right" id="'+connectionId+'Two"></div>');
            connectionElOne = $("#"+connectionId+"One");
            connectionElTwo = $("#"+connectionId+"Two");
            connectionElOne.css("width", planetDistance);
            connectionElTwo.css("width", planetDistance);

            planetOnex = planets[giverId].x;
            planetOney = planets[giverId].y;
            planetTwox = planets[planetId].x;
            planetTwoy = planets[planetId].y;
            deltaY = planetTwoy - planetOney;
            deltaX = planetTwox - planetOnex;
            angle = Math.atan2(deltaY, deltaX);

            connectionElOne.css('left', planetOnex);
            connectionElOne.css('top', planetOney - 5);
            connectionElTwo.css('left', planetOnex);
            connectionElTwo.css('top', planetOney);

            connectionElOne.css("transform", "rotate("+angle+"rad)");
            connectionElTwo.css("transform", "rotate("+angle+"rad)");
          }
        }
      }

    }else if(planet.color === "red") {
      for(var j = 0; j < connectedPlanets.length; j++) {
        receiverColor = planets[connectedPlanets[j].to].color;
        receiver = planets[connectedPlanets[j].to];

        if(connectedPlanets[j].from === planetId
              && receiverColor !== "blue") {
          connectionId = planetId + connectedPlanets[j].to;

          var foundBlue = 0;

          for(var k = 0; k < connectedPlanets.length; k++) {
            if(receiver.id === connectedPlanets[k].to
                  && planets[connectedPlanets[k].from].color === "blue") {
              foundBlue = 1;
            }
          }

          //check if connection is visible.
          var connExists = $("#"+connectionId+"One");

          if(connExists.length !== 0 && foundBlue === 0) {
            //connection is visible and no blue planet found. undraw
            $("#"+connectionId+"One").remove();
            $("#"+connectionId+"Two").remove();
          }else if(connExists.length === 0 && foundBlue > 0) {
            //connection is invisible, but there is a blue planet. draw
            planetDistance = getPlanetDistance(planetId, connectedPlanets[j].to);
            viewport.append('<div class="connection '+planets[planetId].color+' left" id="'+connectionId+'One"></div>');
            viewport.append('<div class="connection '+planets[planetId].color+' right" id="'+connectionId+'Two"></div>');
            connectionElOne = $("#"+connectionId+"One");
            connectionElTwo = $("#"+connectionId+"Two");
            connectionElOne.css("width", planetDistance);
            connectionElTwo.css("width", planetDistance);

            planetOnex = planets[planetId].x;
            planetOney = planets[planetId].y;
            planetTwox = planets[connectedPlanets[j].to].x;
            planetTwoy = planets[connectedPlanets[j].to].y;
            deltaY = planetTwoy - planetOney;
            deltaX = planetTwox - planetOnex;
            angle = Math.atan2(deltaY, deltaX);

            connectionElOne.css('left', planetOnex);
            connectionElOne.css('top', planetOney - 5);
            connectionElTwo.css('left', planetOnex);
            connectionElTwo.css('top', planetOney);

            connectionElOne.css("transform", "rotate("+angle+"rad)");
            connectionElTwo.css("transform", "rotate("+angle+"rad)");
          }
        }
      }
    }else if(true) {
      var redConns = [];
      var foundBlue = 0;

      for(var j = 0; j < connectedPlanets.length; j++) {
        giverColor = planets[connectedPlanets[j].from].color;

        if(connectedPlanets[j].to === planetId && giverColor === "red") {

          conObj = {giver: connectedPlanets[j].from, receiver: connectedPlanets[j].to};

          redConns.push(conObj);
        }else if(connectedPlanets[j].to === planetId
              && giverColor === "blue") {
          foundBlue = 1;
        }
      }

      if(foundBlue > 0 && redConns.length > 0) {
        for(conn in redConns) {
          conn = redConns[conn];

          //check if connection is visible.
          connId = conn.giver + conn.receiver;

          var connExists = $("#"+connId+"One");

          if(connExists.length === 0) {
            //connection is invisible. draw
            planetDistance = getPlanetDistance(conn.giver, conn.receiver);
            viewport.append('<div class="connection '+planets[conn.giver].color+' left" id="'+connId+'One"></div>');
            viewport.append('<div class="connection '+planets[conn.giver].color+' right" id="'+connId+'Two"></div>');
            connectionElOne = $("#"+connId+"One");
            connectionElTwo = $("#"+connId+"Two");
            connectionElOne.css("width", planetDistance);
            connectionElTwo.css("width", planetDistance);

            planetOnex = planets[conn.giver].x;
            planetOney = planets[conn.giver].y;
            planetTwox = planets[conn.receiver].x;
            planetTwoy = planets[conn.receiver].y;
            deltaY = planetTwoy - planetOney;
            deltaX = planetTwox - planetOnex;
            angle = Math.atan2(deltaY, deltaX);

            connectionElOne.css('left', planetOnex);
            connectionElOne.css('top', planetOney - 5);
            connectionElTwo.css('left', planetOnex);
            connectionElTwo.css('top', planetOney);

            connectionElOne.css("transform", "rotate("+angle+"rad)");
            connectionElTwo.css("transform", "rotate("+angle+"rad)");
          }
        }
      }
    }
  }
}

function deleteConnectionsToChaoticPlanets() {
  for(var i = 0; i < connectedPlanets.length; i++) {
    if(planets[connectedPlanets[i].to].inChaos === true) {
      if(planets[connectedPlanets[i].to].color === planets[connectedPlanets[i].from].color) {
        connectionId = connectedPlanets[i].from + connectedPlanets[i].to;

        deleteConnection(connectionId);

        var connExists = $("#"+connectionId+"One");
        if(connExists.length !== 0) {
          //connection is visible. undraw
          $("#"+connectionId+"One").remove();
          $("#"+connectionId+"Two").remove();
        }
      }
    }else if(planets[connectedPlanets[i].from].inChaos === true) {
      connectionId = connectedPlanets[i].from + connectedPlanets[i].to;

      deleteConnection(connectionId);

      var connExists = $("#"+connectionId+"One");
      if(connExists.length !== 0) {
        //connection is visible. undraw
        $("#"+connectionId+"One").remove();
        $("#"+connectionId+"Two").remove();
      }
    }
  }
}

function updatePiePlanets() {
  for(var i = 0; i < planetIds.length; i++) {
    var planetId = planetIds[i];

    //determining which css to add.
    if(planets[planetId].color === "blue") {
      var thisSpinner = ".pie-spinner-blue";
      var thisFiller = ".pie-filler-blue";
      var thisMask = ".pie-mask-blue";

      var otherSpinner = ".pie-spinner-red";
      var otherFiller = ".pie-filler-red";
      var otherMask = ".pie-mask-red";
    } else if(planets[planetId].color === "red") {
      var thisSpinner = ".pie-spinner-red";
      var thisFiller = ".pie-filler-red";
      var thisMask = ".pie-mask-red";

      var otherSpinner = ".pie-spinner-blue";
      var otherFiller = ".pie-filler-blue";
      var otherMask = ".pie-mask-blue";
    }

    if(!($("#"+planetId).hasClass("grey"))) {
      if(planets[planetId].population < 2) {
        //low pop... grey planet out and update pie.
        $("#"+planetId).removeClass(planets[planetId].color);
        $("#"+planetId).addClass("grey");
      }
    }else {
      if(planets[planetId].population >= 2) {
        $("#"+planetId).removeClass("grey");
        $("#"+planetId).addClass(planets[planetId].color);
      }
    }

    if(planets[planetId].population < 2 && planets[planetId].population != 0) {
      //setting divs visibility
      $("#"+planetId).find(thisSpinner).css("opacity", "1");
      if(planets[planetId].population <= 1) {
          $("#"+planetId).find(thisFiller).css("opacity", "0");
          $("#"+planetId).find(thisMask).css("opacity", "1");
      }else {
          $("#"+planetId).find(thisFiller).css("opacity", "1");
          $("#"+planetId).find(thisMask).css("opacity", "0");
      }

      $("#"+planetId).find(otherSpinner).css("opacity", "0");
      $("#"+planetId).find(otherFiller).css("opacity", "0");
      $("#"+planetId).find(otherMask).css("opacity", "0");

      //find spinner angle
      if(planets[planetId].color === "blue") {
        var spinnerAngle = (planets[planetId].population / 2) * 360;
      } else {
        var spinnerAngle = 360 - ((planets[planetId].population / 2) * 360);
      }

      //rotate spinner
      $("#"+planetId).find(thisSpinner).css("transform", "rotate("+spinnerAngle+"deg)");
    }else {
      //make the inner divs invisible
      $("#"+planetId).find(thisSpinner).css("opacity", "0");
      $("#"+planetId).find(thisFiller).css("opacity", "0");
      $("#"+planetId).find(thisMask).css("opacity", "0");

      $("#"+planetId).find(otherSpinner).css("opacity", "0");
      $("#"+planetId).find(otherFiller).css("opacity", "0");
      $("#"+planetId).find(otherMask).css("opacity", "0");
    }
  }
}

var gameStarted = false;

function checkWinState() {
  if (!gameStarted) {
    return;
  }
  var foundBlue = 0;
  var foundRed = 0;

  for(var i = 0; i < planetIds.length; i++) {
    if(planets[planetIds[i]].color === "blue") {
      foundBlue += 1;
      continue;
    }else if(planets[planetIds[i]].color === "red") {
      foundRed += 1;
      continue;
    }
  }

  if(foundBlue > 0 && foundRed === 0){
    return 1; //player won
  }else if(foundBlue === 0 && foundRed > 0) {
    return 2; //ai won
  }else {
    return 0;
  }
}

var winStateAlreadyBinded = false;

function checkWinStateOnServer(cb) {
  if (winStateAlreadyBinded) {
    return;
  }
  winStateAlreadyBinded = true;
  gameRef.child("whoWon").on("value", function(snapshot) {
    cb(snapshot.val());
  });
}

var mainLoop;
var aiChecks;

var startGame = function() {
  mainLoop = setInterval(function() {
    if(starterPlanetSelected === 1) {
      var whoWon = 0;

      if (isPlayerOne) {
          updatePopulations();
      }
      updatePiePlanets();

      if(!inDebug) {
        updateAIConnectionsVisibility();                                         //DEBUG
      }
      deleteConnectionsToChaoticPlanets();
      updatePlanetScales();
      writePlanetPopulations();
      if(isPlayerOne) {
        whoWon = checkWinState();
      } else {
        checkWinStateOnServer(function(value) {
          whoWon = value;
        });
      }
      if(whoWon === 1 || whoWon === 2){

        if(whoWon === 1) {
          whoWon = "You";
          if (isPlayerOne) {
            //yes. they have to be switched so player 2 sees a different message
            gameRef.child("whoWon").set(2);
          }
        }else {
          whoWon = "Player 2";
          if (isPlayerOne) {
            //yes. they have to be switched so player 2 sees a different message
            gameRef.child("whoWon").set(1);
          }
        }

        $(".planet").unbind();
        $("#pause-button").unbind();
        $("#endmenu").show();
        $("#whowon").html(whoWon+" won!");
        delete whoWon;

        clearInterval(mainLoop);
      }
    }
  }, 33);
}

assignId();
findGame();

var playing = true;
$('#mute-button').click(function() {
  var music = $('#soundloop')[0];
  if(!playing) {
    music.play();
    playing = true;
    $('#mute-button').html('Mute');
  }
  else {
    music.pause();
    playing = false;
    $('#mute-button').html('UnMute');
  }
});
