function Planet(id, x, y, gameController) {
  // Public methods.

  this.updatePopulation = function(secElapsed) {
    // Update natural growth.
    updateNaturalGrowth(secElapsed);

    // Update connection.
    updateConnection(secElapsed);
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
    self.expeditionersSent = 0;
  }

  this.distanceTo = function(other) {
    return Math.sqrt((Math.pow(self.x - other.x), 2) +
        Math.pow((self.y - other.y), 2));
  }

  this.receivePopulation = function(people) {
    self.population += people;

    // These checks should all be in cosmosController.
    if (self.population >= 1000) {
      self.population = 1000;

      if (!self.inChaos) {
        gc.getGameplayController().input({
          'eventName': 'enterChaos',
          'agent': self
        });
      }
    }
  }

  this.retrievePopulation = function(people) {
    self.population -= people;

    if (self.population <= 0) {
      gc.getGameplayController().input({
          'eventName': 'evacuate',
          'agent': self
      });
    }
  }

  this.addToExpedition = function(people) {
    self.expeditionersSent += people;
  }

  this.isConnectionComplete = function() {
    return (self.expeditionersSent - self.expeditionCost) >= 0;
  }

  this.completeConnection = function(cb) {
    var leftOverPeople = self.expeditionersSent - self.expeditionCost;
    self.connectedTo = self.connectingTo;
    self.connectingTo = null;
    self.expeditionersSent = 0;
    self.expeditionCost = 0;
    cb(leftOverPeople);
  }

  this.evacuate = function() {
    self.owner = null;
    self.popType = null;
    self.disconnect();
    self.population = 0;
    self.inChaos = false;  // Just to be sure.
  }

  // Private methods.

  function updateNaturalGrowth(secElapsed) {
    // TODO(irapha). Should also be an event.
  }

  function updateConnection(secElapsed) {
    var other = self.connectingTo || self.connectedTo;

    if (other) {
      var numberTransfered = getTransferRate() * secElapsed;
      gc.getGameplayController().input({
        'eventName': 'transfer',
        'agent': self,
        'from': self,
        'to': other,
        'people': numberTransfered
      });
    }
  }

  function getExpeditionCost(distance) {
    // Expedition cost is 10 * (dist / minDist)^2.5.
    return 10 * Math.pow((distance/minDistBetweenPlanets), 2.5);
  }

  function getTransferRate() {
    // TODO(irapha): Make this non linear. Curve a bit upwards.
    var minRate = 1;
    var maxRate = 15;
    var maxPop = 1000;
    var slope = (maxRate - minRate) / maxPop;
    return slope * self.population + minRate; // People per second.
  }

  function getGrowthRate() {
    // TODO(irapha): Dependent on current population. Make non linear Curve a LOT upwards.
    return 0.2; // People per second.
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
  this.popType = null;  // When 0 < population < 2, indicates owner of pop.
  this.inChaos = false;
  this.connectingTo = null;
  this.expeditionCost = 0;
  this.expeditionersSent = 0;
  this.connectedTo = null;

  lc.log(self, 'Initialized.');
}
