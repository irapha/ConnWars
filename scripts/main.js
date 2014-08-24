var planets = {};
var planetIds = [];
var selectedPlanets = [];
var connectedPlanets = [];
var connectionIds = [];
var planetsPerSide = 10;
var viewport = $('#viewport');
var levelWidth = viewport.width();
var levelHeight = viewport.height();
var selectedPlanet;
var bluePlanets = [];
var redPlanets = [];
var starterPlanetSelected = 0;

function setupLevel() {
  var cellWidth = levelWidth/10;
  var cellHeight = levelHeight/10;
  var currentId = 0;
  var offLimits = [27, 28, 35, 36]; // center four on 8x8 grid
  var allowedCells = [];
  for(var i=0; i<100; i++) {
    if(offLimits.indexOf(i) === -1)
      allowedCells.push(i);
  }
  for(var i=0; i<planetsPerSide; i++) {
    var randomCellIndex = allowedCells[~~(Math.random()*allowedCells.length)];
    var cellCoords = indexToCoords(randomCellIndex);
    var invertedCoords = {x:9-cellCoords.x, y:9-cellCoords.y};
    var invertedIndex = coordsToIndex(invertedCoords);
    allowedCells.splice(allowedCells.indexOf(randomCellIndex), 1);
    allowedCells.splice(allowedCells.indexOf(invertedIndex), 1);
    removeAdjacentIndices(randomCellIndex);
    removeAdjacentIndices(invertedIndex);
    cellCoords.x*=cellWidth;
    cellCoords.y*=cellHeight;
    cellCoords.x += cellWidth/2;
    cellCoords.y += cellHeight/2;
    invertedCoords.x*=cellWidth;
    invertedCoords.y*=cellHeight;
    invertedCoords.x += cellWidth/2;
    invertedCoords.y += cellHeight/2;

    var planetId = 'planet' + currentId;
    planets[planetId] = {color:'grey', x:cellCoords.x, y:cellCoords.y, id:planetId,
                        selected:false, population:0};
    planetIds.push(planetId);
    viewport.append('<div class="planet grey" id="'+planetId+'" align="center"></div>');
    currentId++;

    planetId = 'planet' + currentId;
    planets[planetId] = {color:'grey', x:invertedCoords.x, y:invertedCoords.y, id:planetId,
                        selected:false, population:0};
    planetIds.push(planetId);
    viewport.append('<div class="planet grey" id="'+planetId+'" align="center"></div>');
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

  $(".planet").click(function() {
    planetClicked($(this));
  });

  $("body").click(function() {
    bodyClicked();
  });
}

function initialDraw() {
  planetIds.forEach(function(planetId) {
    var planet = planets[planetId];
    var planetEl = $("#"+planetId);
    planetEl.css("left", planet.x-15);
    planetEl.css("top", planet.y-15);
  });
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

function planetClicked(planetEl) {
  var planetId = planetEl.attr("id");
  var planet = planets[planetId];

  //delete connections from the selected planet, if they exist
  for(var i = 0; i < connectedPlanets.length; i++) {
    if(connectedPlanets[i].from === planetId && (selectedPlanets.length === 0)) {
      connectionId = planetId + connectedPlanets[i].to;
      connectedPlanets.splice(i, 1);
      $("#"+connectionId+"One").remove();
      $("#"+connectionId+"Two").remove();

      for(var j = 0; j < connectionIds.length; j++) {
        if(connectionIds[j] === connectionId) {
          connectionIds.splice(j, 1);
        }
      }
    }
  }

  if(selectedPlanets.length === 0) {
    if(planet.color != "grey") {
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
      //make connection between the two planets
      connectedPlanets.push({from: selectedPlanets[0], to: planetId});
      connectionId = selectedPlanets[0] + planetId;
      //deselect planets
      $('#'+selectedPlanets[0]).toggleClass('selected');
      planets[selectedPlanets[0]].selected = !planets[selectedPlanets[0]].selected;
      planet.selected = !planet.selected;
      //draw connection
      planetDistance = getPlanetDistance(selectedPlanets[0], planetId);
      viewport.append('<div class="connection blue left" id="'+connectionId+'One"></div>');
      viewport.append('<div class="connection blue right" id="'+connectionId+'Two"></div>');
      connectionElOne = $("#"+connectionId+"One");
      connectionElTwo = $("#"+connectionId+"Two");
      connectionElOne.css("width", planetDistance);
      connectionElTwo.css("width", planetDistance);
      connectionIds.push(connectionId);

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

function requestStarterPlanet(){
  $(".planet").click(function() {
    if(starterPlanetSelected === 1){
      return;
    };
    var planetId = $(this).attr("id");
    var planet = planets[planetId];
    planet.population = 100;
    planet.color = "blue";
    $("#"+planetId).removeClass("grey");
    $("#"+planetId).addClass("blue");
    starterPlanetSelected = 1;
  });
}

function updatePopulations() {
  for(var i = 0; i < connectedPlanets.length; i++) {
    giver = planets[connectedPlanets[i].from];
    receiver = planets[connectedPlanets[i].to];
    newPops = getPlanetPopulations(giver, receiver);
    newPops_zero = ~~newPops[0];
    newPops_one = ~~newPops[1];
    var oldGiverColor = giver.color;

    //if new population is zero (or accidentally negative), change color to grey
    if(newPops_zero <= 0){
      newPops[0] = 0;
      $("#"+giver.id).removeClass(giver.color);
      $("#"+giver.id).addClass("grey");
      giver.color = "grey";
      //delete connection this planet has with others
      for(var i = 0; i < connectedPlanets.length; i++) {
        if(connectedPlanets[i].from === giver.id) {
          connectionId = giver.id + connectedPlanets[i].to;
          connectedPlanets.splice(i, 1);
          $("#"+connectionId+"One").remove();
          $("#"+connectionId+"Two").remove();

          for(var j = 0; j < connectionIds.length; j++) {
            if(connectionIds[j] === connectionId) {
              connectionIds.splice(j, 1);
            }
          }
        }
      }
    }
    giver.population = newPops[0];
    //if new population is negative, change color to oposite
    if(newPops_one < 0) {
      newPops[1] = (-1)*newPops[1];
      if(receiver.color === "red") {
        var newColor = "blue";
      }else if(receiver.color === "blue") {
        var newColor = "red";
      }
      $("#"+receiver.id).removeClass(receiver.color);
      $("#"+receiver.id).addClass(newColor);
      receiver.color = newColor;
      //delete all connections from receiver.
      for(var i = 0; i < connectedPlanets.length; i++) {
        if(connectedPlanets[i].from === receiver.id) {
          connectionId = receiver.id + connectedPlanets[i].to;
          connectedPlanets.splice(i, 1);
          $("#"+connectionId+"One").remove();
          $("#"+connectionId+"Two").remove();

          for(var j = 0; j < connectionIds.length; j++) {
            if(connectionIds[j] === connectionId) {
              connectionIds.splice(j, 1);
            }
          }
        }
      }
    }
    if(receiver.population < 1) {
      if(receiver.color === "grey" && oldGiverColor === giver.color) {
        $("#"+receiver.id).removeClass(receiver.color);
        $("#"+receiver.id).addClass(oldGiverColor);
        receiver.color = oldGiverColor;
      }else {
        newPops[1] = 0;
      }
    }
    receiver.population = newPops[1];
  }

  for(var i = 0; i < planetIds.length; i++) {
    planet = planets[planetIds[i]];
    if(planet.population > 0) {
        planet.population = getNaturalGrowth(planetIds[i]);
    }
  }
}

function updatePlanetScales() {
  for(var i = 0; i < planetIds.length; i++) {
    planet = planets[planetIds[i]];
    planetPop = planet.population;
    if(planetPop > 100) {
      var planetScale = (0.0000010001)*(planetPop-100) + 1;
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

    if(planetPop > 0) {
      $("#"+planetId).html(planetPop);
    }
  }
}

function wipeZeroedPlanets() {
  for(var i = 0; i < planetIds.length; i++){
      planet = planets[planetIds[i]];
      planetPop = ~~planet.population;
      planetId = planet.id;
      if(planetPop === 0){
          $("#"+planetId).removeClass(planet.color);
          $("#"+planetId).addClass("grey");
          planet.color = "grey";
      }
  }
}

function bodyClicked() {
  if(selectedPlanets.length > 0) {
    $('#'+selectedPlanets[0]).toggleClass('selected');
    planets[selectedPlanets[0]].selected = !planets[selectedPlanets[0]].selected;

    if(selectedPlanets > 1) {
        $('#'+selectedPlanets[1]).toggleClass('selected');
        planets[selectedPlanets[1]].selected = !planets[selectedPlanets[1]].selected;
    }

    selectedPlanets = [];
  }
}

setupLevel();
initialDraw();
requestStarterPlanet();
setInterval(function() {
  updatePopulations();
  wipeZeroedPlanets();
  updatePlanetScales();
  writePlanetPopulations();
}, 33);
