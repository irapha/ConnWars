function CosmosController(gameController) {
  // Public methods.

  this.toStr = function() {
    return 'CosmosController';
  }

  this.getPlanet = function(planetId) {
    return self.planets[planetId];
  }

  this.createPlanets = function(cb) {
    var planetDensity = 0.000025;  // Planets per pixel.

    lc.log(self, 'Creating planets with density ' + planetDensity + 'ppp^2.');

    gc.getViewController()
      .getPlanetPositions(planetDensity, function(planetPositions) {
        var planetId = 0;

        for (var i in planetPositions) {
          var planetPosition = planetPositions[i];
          var newPlanet = new Planet(planetId,
                                     planetPosition.x, planetPosition.y,
                                     gc);

          self.planets.splice(newPlanet.id, 0, newPlanet);
          planetId++;
        }

        cb(self.planets);
      });
  }

  // Constructor.

  var self = this;
  var gc = gameController;
  var lc = gc.getLoggingController();

  this.planets = [];

  lc.log(self, 'Initialized.');
}
