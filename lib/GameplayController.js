function GameplayController(gameController) {
  // Public methods.

  this.deselectPlanets = function() {
    lc.log(self, 'Planets deselected.');
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
