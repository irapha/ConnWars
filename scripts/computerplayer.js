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
  }
}
