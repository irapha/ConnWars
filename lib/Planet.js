function Planet(id, x, y, gameController) {
  // Getters / Setters

  this.getId = function() {
    return 'planet' + this.id;
  }

  // Public methods.

  this.updatePopulation = function() {

  }

  this.click = function() {
    lc.log(self, 'Clicked.');
    gc.getPlayerController().clickPlanet(this);
  }

  this.toStr = function() {
    return 'Planet' + planet.id;
  }

  // Constructor.

  var self = this;
  var gc = gameController;
  var lc = gc.getLoggingController();

  this.id = id;
  this.population = 0;
  this.x = x;
  this.y = y;
  this.color = 'grey';
  this.inChaos = false;

  lc.log(self, 'Initialized.');
}
