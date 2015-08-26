function GameController() {
  this.viewController = new ViewController(this);
  this.playerController = new PlayerController(this);
  this.aiController = new AiController(this);

  this.gameplayController = new GameplayController(this);

  // The start of game control.
  this.main = function() {

  }

  // Deselect all planets, if any are selected.
  this.deselectPlanets = function() {

  }

  // Getters / Setters

  this.getViewport = function() {
    return $('#viewport');
  }

  this.getPlayerController = function() {
    return this.playerController;
  }
}
