function AiController(gameController) {
  // Public methods.

  this.toStr = function() {
    return 'AiController';
  }

  // Constructor.

  var self = this;
  var gc = gameController;
  var lc = gc.getLoggingController();

  lc.log(self, 'Initialized.');
}
