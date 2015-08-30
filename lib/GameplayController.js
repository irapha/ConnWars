function GameplayController(gameController) {
  // Private methods.

  function gameReady() {
    lc.log(self, 'Starting game.');
    gc.getPlayerController().gameStarted = true;
    gc.getAiController().gameStarted = true;
    // TODO(irapha): start game loop.
  }

  // Public methods.

  this.claimPlayerPlanet = function(planet) {
    planet.owner = 'player';
    planet.population = 100;
    gc.getAiController().claimPlanet();
  }

  this.claimAiPlanet = function(planet) {
    planet.owner = 'ai';
    planet.population = 100;
    gameReady();
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
