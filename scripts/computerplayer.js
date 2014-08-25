var ai = {
  selectStarterPlanet: function() {
    var availablePlanets = $('.planet.grey');
    var starterPlanetIndex = ~~(Math.random()*availablePlanets.length);
    var starterPlanet = $(availablePlanets[starterPlanetIndex]);
    var planetId = starterPlanet.attr("id");
    var planet = planets[planetId];
    planet.population = 100;
    planet.color = "red";
    starterPlanet.removeClass("grey");
    starterPlanet.addClass("red");
  },

  updateConnections: function() {
  }
}
