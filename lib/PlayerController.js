function PlayerController(gameController) {
  // Public methods.

  this.clickPlanet = function(planetId) {
    var planet = gc.getGameplayController()
      .getCosmosController()
      .getPlanet(planetId);

    // TODO(irapha): handle click event.

    lc.log(self, planet.toStr() + ' clicked.');
  }

  this.toStr = function() {
    return 'PlayerController';
  }

  // Constructor.

  var self = this;
  var gc = gameController;
  var lc = gc.getLoggingController();

  lc.log(self, 'Initialized.');
}
