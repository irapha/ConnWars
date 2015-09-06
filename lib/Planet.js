function Planet(id, x, y, gameController) {
  // Public methods.

  this.updatePopulation = function() {

  }

  this.toStr = function() {
    return 'Planet' + self.id + ' (' + self.x + ', ' + self.y + ')';
  }

  this.startConnectionTo = function(receiver) {
    lc.log(self, 'Starting connection to ' + receiver.toStr() + '.');
    self.disconnect();
    self.connectingTo = receiver;
    self.expeditionCost = getExpeditionCost(self.distanceTo(receiver));
  }

  this.disconnect = function() {
    self.connectedTo = null;
    self.connectingTo = null;
    self.expeditionCost = 0;
    self.expeditionersSpent = 0;
  }

  this.distanceTo = function(other) {
    return Math.sqrt((Math.pow(self.x - other.x), 2) +
        Math.pow((self.y - other.y), 2));
  }

  // Private methods.

  function getExpeditionCost(distance) {
    // Expedition cost is 8 * (dist / minDist)^2.
    return 8 * Math.pow((distance/minDistBetweenPlanets), 2);
  }

  // Constructor.

  var self = this;
  var gc = gameController;
  var lc = gc.getLoggingController();
  var minDistBetweenPlanets = 100;  // Taken from LevelCreator.

  this.id = id;
  this.population = 0;
  this.x = x;
  this.y = y;
  this.owner = null;
  this.inChaos = false;
  this.connectingTo = null;
  this.expeditionCost = 0;
  this.expeditionersSpent = 0;
  this.connectedTo = null;

  lc.log(self, 'Initialized.');
}
