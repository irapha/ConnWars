function GameplayController(gameController) {
  // Private methods.

  function gameReady() {
    lc.log(self, 'Starting game.');
    // TODO(irapha): start game loop.
  }

  // Public methods.

  this.claimPlayerPLanet(planet) {
    planet.owner = 'player';
    planet.population = 100;
    gc.getAiController().claimPlanet(gameReady);
  }

  this.getCosmosController = function() {
    return this.cosmosController;
  }

  this.toStr = function() {
    return 'GameplayController';
  }

  // Constructor.

  var self = this;
  var gc = gameController;
  var lc = gc.getLoggingController();

  this.cosmosController = new CosmosController(gc);

  lc.log(self, 'Initialized.');
}
