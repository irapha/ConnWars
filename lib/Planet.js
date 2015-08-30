function Planet(id, x, y, gameController) {
  // Public methods.

  this.updatePopulation = function() {

  }

  this.toStr = function() {
    return 'Planet' + self.id + ' (' + self.x + ', ' + self.y + ')';
  }

  // Constructor.

  var self = this;
  var gc = gameController;
  var lc = gc.getLoggingController();

  this.id = id;
  this.population = 0;
  this.x = x;
  this.y = y;
  this.owner = null;
  this.inChaos = false;
  this.connectedTo = null;

  lc.log(self, 'Initialized.');
}
