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
      // TODO(irapha): handle click event.

      lc.log(self, planet.toStr() + ' clicked.');
    } else {
      lc.log(self, 'Claiming ' + planet.toStr());
      self.gameStarted = true;
      gc.getGameplayController().claimPlayerPlanet(planet);
    }
  }

  this.deselectPlanets = function() {
    // TODO(irapha): Actually deselect planets.

    lc.log(self, 'Planets deselected.');
  }

  this.toStr = function() {
    return 'PlayerController';
  }

  // Constructor.

  var self = this;
  var gc = gameController;
  var lc = gc.getLoggingController();

  var gameStarted = false;
  var selectedPlanet = null;

  this.color = 'blue';

  lc.log(self, 'Initialized.');
}
