function GameController() {
  // Getters / Setters

  this.getPlayerController = function() {
    return self.playerController;
  }

  this.getAiController = function() {
    return self.aiController;
  }

  this.getGameplayController = function() {
    return self.gameplayController;
  }

  this.getLoggingController = function() {
    return lc;
  }

  this.getViewController = function() {
    return self.viewController;
  }

  // Public methods.

  this.toStr = function() {
    return 'GameController';
  }

  // Constructor and game initializer.

  var self = this;
  var lc = new LoggingController();

  lc.log(self, 'Initializing system controllers.');
  this.viewController = new ViewController(self);
  this.audioController = new AudioController(lc);

  lc.log(self, 'Initializing agent controllers.');
  this.playerController = new PlayerController(self);
  this.aiController = new AiController(self);

  lc.log(self, 'Initializing gameplay controller.');
  this.gameplayController = new GameplayController(self);

  lc.log(self, 'Initializing game.');
  this.gameplayController
    .getCosmosController()
    .createPlanets(afterPlanetsCreated);

  function afterPlanetsCreated(planetList) {
    self.viewController.initialDraw(planetList);
  };
}
