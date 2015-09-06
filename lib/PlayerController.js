function PlayerController(gameController) {
  // Private methods.

  function getPlanetById(planetId) {
    return gc.getGameplayController()
      .getCosmosController()
      .getPlanet(planetId);
  }

  // Public methods.

  this.clickPlanet = function(planetId) {
    var planet = getPlanetById(planetId);

    if (self.gameStarted) {
      // Game started.
      if (self.selectedPlanet === null) {
        self.selectPlanet(planet);
      } else if (self.selectedPlanet === planet) {
        self.deselectPlanets();
      } else {
        self.connectPlanets(self.selectedPlanet, planet);
      }
    } else {
      // Game not started.
      lc.log(self, 'Claiming ' + planet.toStr());
      gc.getGameplayController().claimPlayerPlanet(planet);
    }
  }

  this.connectPlanets = function(giver, receiver) {
    if (self.gameStarted && giver.owner === 'player') {
      lc.log(self, 'Connecting ' + giver.toStr() +
          ' and ' + receiver.toStr());

      gc.getGameplayController().input({
        agent: 'player',
        eventName: 'connectPlanets',
        giver: self.selectedPlanet,
        receiver: receiver
      });

      self.deselectPlanets();
    } else if (giver.owner !== 'player') {
      lc.log(self, 'WARNING: Player attemped to connect from non-player ' +
          'planet: ' + giver.toStr() + ' to ' + receiver.toStr() + '.');
    }
  }

  this.selectPlanet = function(planet) {
    if (self.gameStarted && planet.owner === 'player') {
      lc.log(self, planet.toStr() + ' selected.');

      self.selectedPlanet = planet;

      gc.getGameplayController().input({
          agent: 'player',
          eventName: 'disconnectPlanet',
          planet: planet
        });
    } else if (planet.owner !== 'player') {
      lc.log(self, 'WARNING: Player attemped to select non-player planet: ' +
          planet.toStr() + '.');
    }
  }

  this.deselectPlanets = function() {
    if (self.gameStarted) {
      lc.log(self, 'Planets deselected.');
      self.selectedPlanet = null;
    }
  }

  this.toStr = function() {
    return 'PlayerController';
  }

  // Constructor.

  var self = this;
  var gc = gameController;
  var lc = gc.getLoggingController();

  this.gameStarted = false;
  this.selectedPlanet = null;
  this.color = 'blue';

  lc.log(self, 'Initialized.');
}
