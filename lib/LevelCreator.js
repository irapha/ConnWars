function LevelCreator(gameController) {
  // Public methods.

  this.toStr = function() {
    return 'LevelCreator';
  }

  this.createLevel = function(planetDensity, cb) {
    lc.log(self, 'Creating level.');

    // TODO(irapha): Replace with fancy level creation algo.
    var planetPositions = [ { x: 10, y: 15 }, { x: 25, y: 50 }];

    cb(planetPositions);
  }

  var self = this;
  var gc = gameController;
  var lc = gc.getLoggingController();
  var vc = gc.getViewController();

  lc.log(self, 'Initialized.');
}
