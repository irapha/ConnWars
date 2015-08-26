function GameController() {
  // Getters / Setters

  this.getViewport = function() {
    return $('#viewport');
  }

  this.getPlayerController = function() {
    return this.playerController;
  }

  this.getGameplayController = function() {
    return this.gameplayController;
  }

  this.getLoggingController = function() {
    return lc;
  }

  // Public methods.

  this.main = function() {
    // The start of game control.
    lc.log(self, 'Initializing game.');
    this.viewController.initialDraw();
  }

  this.toStr = function() {
    return 'GameController';
  }

  // Constructor

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
}
