function AiController(gameController) {
  // Public methods.

  this.claimPlanet = function(cb) {
    // TODO(irapha): make Ai claim a planet on the opposite side as player's planet.

    lc.log(self, 'Claiming planet...');

    cb();
  }

  this.toStr = function() {
    return 'AiController';
  }

  // Constructor.

  var self = this;
  var gc = gameController;
  var lc = gc.getLoggingController();

  this.color = 'orange';

  lc.log(self, 'Initialized.');
}
