var planets = {};
var planetIds = [];
var selectedPlanets = [];
var connectedPlanets = [];
var connectionIds = [];
var totalPlanets = 10;
var levelWidth = $(window).width()-100;
var levelHeight = $(window).height()-100;
var viewport = $('#viewport');
var selectedPlanet;
var bluePlanets = [];
var redPlanets = [];
var starterPlanetSelected = 0;

function setupLevel() {
  currentId = 0;
  for(var i=0; i<totalPlanets; i++) {
    var randomX = ~~(levelWidth/2)*Math.random();
    var randomY = ~~(levelHeight)*Math.random();
    var mirrorX = levelWidth-randomX;
    var mirrorY = levelHeight-randomY;
    var planetId = 'planet' + currentId;
    planets[planetId] = {color:'grey', x:randomX, y:randomY, id:planetId,
                        selected:false, population:0};
    planetIds.push(planetId);
    viewport.append('<div class="planet grey" id="'+planetId+'"></div>');
    currentId++;

    planetId = 'planet' + currentId;
    planets[planetId] = {color:'grey', x:mirrorX, y:mirrorY, id:planetId,
                        selected:false, population:0};
    planetIds.push(planetId);
    viewport.append('<div class="planet grey" id="'+planetId+'"></div>');
    currentId++;
  }

  $(".planet").click(function() {
    planetClicked($(this));
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
      $("#"+connectionId).remove();

      for(var j = 0; j < connectionIds.length; j++) {
        if(connectionIds[j] === connectionId) {
          connectionIds.splice(j, 1);
        }
      }
    }
  }

  if(selectedPlanets.length === 0) {
    planet.selected = !planet.selected;
    planetEl.toggleClass('selected');
    selectedPlanets.push(planetId);
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
      viewport.append('<div class="connection blue" id="'+connectionId+'"></div>');
      connectionEl = $("#"+connectionId);
      connectionEl.css("width", planetDistance);
      connectionIds.push(connectionId);

      planetOnex = planets[selectedPlanets[0]].x;
      planetOney = planets[selectedPlanets[0]].y;
      planetTwox = planets[planetId].x;
      planetTwoy = planets[planetId].y;
      deltaY = planetTwoy - planetOney;
      deltaX = planetTwox - planetOnex;
      angle = Math.atan2(deltaY, deltaX);

      connectionEl.css('left', planetOnex);
      connectionEl.css('top', planetOney - 5);
      connectionEl.css("transform", "rotate("+angle+"rad)");

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
    //if new population is zero (or accidentally negative), change color to grey
    if(newPops[0] <= 0){
      newPops[0] = 0;
      $("#"+giver.id).removeClass(giver.color);
      $("#"+giver.id).addClass("grey");
      giver.color = "grey";
      //delete connection this planet has with others
      for(var i = 0; i < connectedPlanets.length; i++) {
        if(connectedPlanets[i].from === giver.id) {
          connectionId = giver.id + connectedPlanets[i].to;
          connectedPlanets.splice(i, 1);
          $("#"+connectionId).remove();

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
    if(newPops[1] < 0) {
      newPops[1] = (-1)*newPops[1];
      if(receiver.color === "red") {
        var newColor = "blue";
      }else if(receiver.color === "blue") {
        var newColor = "red";
      }
      $("#"+receiver.id).removeClass(receiver.color);
      $("#"+receiver.id).addClass(newColor);
      receiver.color = newColor;
    }
    if(receiver.population === 0) {
      if(receiver.color === "grey") {
        $("#"+receiver.id).removeClass(receiver.color);
        $("#"+receiver.id).addClass(giver.color);
        receiver.color = giver.color;
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

setupLevel();
initialDraw();
requestStarterPlanet();
setInterval(function() {
  updatePopulations();
  updatePlanetScales();
}, 33);
