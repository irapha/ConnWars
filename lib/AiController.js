function AiController(gameController) {
  // Public methods.

  this.claimPlanet = function() {
    var planetPicker = new AiPlanetPicker(gc);

    var planets = gc.getGameplayController()
      .getCosmosController()
      .getPlanets();

    planetPicker.pickPlanet(planets, afterPlanetPicked);

    function afterPlanetPicked(planet) {
      lc.log(self, 'Claiming ' + planet.toStr());
      gc.getGameplayController().claimAiPlanet(planet);
    }
  }

  this.toStr = function() {
    return 'AiController';
  }

  // Constructor.

  var self = this;
  var gc = gameController;
  var lc = gc.getLoggingController();

  this.gameStarted = false;

  this.color = 'orange';

  lc.log(self, 'Initialized.');
}
