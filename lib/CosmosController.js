function CosmosController(gameController) {
  // Public methods.

  this.toStr = function() {
    return 'CosmosController';
  }

  this.getPlanet = function(planetId) {
    return self.planets[planetId];
  }

  this.getPlanets = function() {
    return this.planets;
  }

  this.createPlanets = function(cb) {
    var planetDensity = 0.000025;  // Planets per pixel.

    lc.log(self, 'Creating planets with density ' + planetDensity + 'ppp^2.');

    gc.getViewController()
      .getPlanetPositions(planetDensity, function(planetPositions) {
        lc.log(self, 'Initializing planets.');

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

  this.updatePlanetsPopulations = function(secElapsed) {
    for (var i in self.planets) {
      self.planets[i].updatePopulation(secElapsed);
    }
  }

  this.transfer = function(from, to, people) {
    // Asset that to and from's connection is the same...

    if (from.connectingTo !== null) {
      from.retrievePopulation(people);  // Retrieve expeditioners
      from.addToExpedition(people)  // Update num expeditioners sent.

      // Make expeditioner's checks. If done connecting, create complete connection event.
      if (from.isConnectionComplete()) {
        gc.getGameplayController().input({
            'eventName': 'completeConnection',
            'agent': from
        });
      }

    } else if (from.connectedTo !== null) {
      // Change from's population. Change to's population.
      // All according to their owners (or popType if either of their population is still 0<pop<2)
      // Also make all checks for 0<pop<2 (remove owner, set popType, etc.).
      // Also handle evacuation when from's pop < 0 and handle takeover when to's pop < 0.
      // Also handle enter and exit chaos status.
      // Make sure that no planet with chaos status can transfer.
      // And I havent's even started talking about the helper connection to chaotic planets...

    } else {
      lc.log(self, 'WARNING: ' + from.toStr() + ' tried transfering ' +
          people + ' people with no active connection.');
    }

    if (from.owner === to.owner) {
      // Transfering to planet of same color.

    } else if (to.owner === null) {
      // Transferring to a grey planet.
      // TODO HOW TO HANDLE WHEN BOTH AI AND PLAYER ARE ADDING TO A PLANET'S POP?
    } else {
      // Transfering to enemy planet.
      // TODO: HANDLE WHEN TO's POP GOES NEGATIVE...
    }
  }

  // Constructor.

  var self = this;
  var gc = gameController;
  var lc = gc.getLoggingController();

  this.planets = [];

  lc.log(self, 'Initialized.');
}
