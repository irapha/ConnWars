var ai = {
  selectStarterPlanet: function() {
    var availablePlanets = $('.planet.grey');
    var starterPlanetIndex = ~~(Math.random()*availablePlanets.length);
    var starterPlanet = $(availablePlanets[starterPlanetIndex]);
    var planetId = starterPlanet.attr("id");
    var planet = planets[planetId];
    planet.population = 1000;
    planet.color = "red";
    starterPlanet.removeClass("grey");
    starterPlanet.addClass("red");
  },

  updateConnections: function() {
    var availableRedPlanets = [];
    var unavailableRedPlanets
    var availableBluePlanets = [];
    var greyPlanets = [];

    planetIds.forEach(function(planetId) {
      var planet = planets[planetId];
      if(planet.color==='red') {
        availableRedPlanets.push(planetId);
      }
      else if(planet.color==='blue') {
        availableBluePlanets.push(planetId);
      }
      else {
        greyPlanets.push(planets[planetId]);
      }
    });

    var self = this;
    connectedPlanets.forEach(function(connection) {
      var from = planets[connection.from];
      var to = planets[connection.to];

      // Find all red connections to blue planets
      // If blue has higher population, close connection
      if(from.color==='red' && to.color==='blue'
          && to.population>from.population) {
        self.closeConnection(from);
      }
      // Find all blue connections to red planets
      // If blue has higher population, evacuate to closest grey or red planet
      else if(from.color==='blue' && to.color==='red'
          && from.population>to.population) {
        self.evacuatePlanet(to);
      }

      // Find all red connections to red planets
      // If the to planet has a population higher than 10% of the from planet, remove that connection
      else if(from.color==='red' && to.color==='red'
          && to.population/from.population>0.1) {
        self.closeConnection(from);
      }

      if(from.color==='blue' && availableBluePlanets.indexOf(from.id)!==-1) {
        var index = availableBluePlanets.indexOf(from.id);
        availableBluePlanets.splice(index, 1);
      }
      else if(from.color==='red' && availableRedPlanets.indexOf(from.id)!==-1) {
        var index = availableRedPlanets.indexOf(from.id);
        availableRedPlanets.splice(index, 1);
      }
    });

    // Find highest populated red planet
    // Choose the closest grey planet and make a connection
    availableRedPlanets.sort(function(a, b) {
      return planets[b].population-planets[a].population;
    });
    var highestPopulatedRed = planets[availableRedPlanets[0]];
    var greyPlanet = this.closestPlanet(highestPopulatedRed, greyPlanets);
    this.connectPlanets(highestPopulatedRed, greyPlanet);

    // Find the lowest populated blue planet where a connection isn't open
    // Find all red planets with populations higher than that blue planet that don't have connections
    // Connect the closest red planet from the selection to the blue planet
  },

  updateConnectionsRandom: function() {
    // finds all unconnected red planets, selects a random one, and creates a new connection to a random planet
    var redPlanets = [];
    var connectedRedPlanets = [];
    var unpopulatedPlanets = [];
    connectedPlanets.forEach(function(connection) {
      if(redPlanets.indexOf(connection.from)!==-1) {
        connectedRedPlanets.push(connection.from);
      }
    });

    var unconnectedRedPlanets = [];
    planetIds.forEach(function(planetId) {
      var planet = planets[planetId];
      if(planet.color==='red' && connectedRedPlanets.indexOf(planetId)===-1) {
        unconnectedRedPlanets.push(planetId);
      }
    });
    var newConnectedPlanet = unconnectedRedPlanets[~~(Math.random()*unconnectedRedPlanets.length)];
    var randomPlanet = planetIds[~~(Math.random()*planetIds.length)];
    if(newConnectedPlanet && randomPlanet && newConnectedPlanet!==randomPlanet) {
      planetClicked($('#'+newConnectedPlanet), true);
      planetClicked($('#'+randomPlanet), true);
    }
  },

  closestPlanet: function(planet, adjPlanetList) {
    var closestDist = getPlanetDistance(planet.id, adjPlanetList[0].id);
    var closest = adjPlanetList[0];
    for(var i=1; i<adjPlanetList.length; i++) {
      var dist = getPlanetDistance(planet.id, adjPlanetList[i].id);
      if(dist < closestDist) {
        closestDist = dist;
        closest = adjPlanetList[i];
      }
    }
    return closest;
  },

  closeConnection: function(planet) {
    var planetEl = $('#'+planet.id);
    planetClicked(planetEl, true);
    planetClicked(planetEl, true);
  },

  evacuatePlanet: function(planet) {

  },

  connectPlanets: function(planet1, planet2) {
    var planet1El = $('#'+planet1.id);
    var planet2El = $('#'+planet2.id);
    planetClicked(planet1El, true);
    planetClicked(planet2El, true);
  }
}
