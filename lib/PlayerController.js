function PlayerController(gameController) {
  // Public methods.

  this.clickPlanet = function(planet) {

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
