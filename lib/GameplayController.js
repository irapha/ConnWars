function GameplayController(gameController) {
  // Public methods.

  this.deselectPlanets = function() {
    lc.log(self, 'Planets deselected.');
  }

  this.toStr = function() {
    return 'GameplayController';
  }

  // Constructor.

  var self = this;
  var gc = gameController;
  var lc = gc.getLoggingController();

  lc.log(self, 'Initialized.');
}
