function GameplayController(gameController) {
  // Private methods.

  function gameReady() {
    lc.log(self, 'Starting game.');
    gc.getPlayerController().gameStarted = true;
    gc.getAiController().gameStarted = true;

    self.loop = MainLoop.setBegin(checkGameOverAndProcessInputs)
      .setUpdate(updateGameState)
      .setDraw(renderGame)
      .setEnd(cleanUp)
      .start();

    function checkGameOverAndProcessInputs() {
      // Check for end state.
      checkGameOver(ifGameOver, ifGameNotOver);

      function ifGameOver(winner) {
        handleGameOver(winner);
        return;
      }

      function ifGameNotOver() {
        // Process input events.
        processInputEvents();
      }
    }

    function renderGame(interpolationPercentage) {
      gc.getViewController().render(interpolationPercentage);
    }

    function cleanUp(fps, panic) {
      if (panic) {
        lc.log(self, 'Game loop panicked. FPS: ' + fps + '. Exiting game.');
        self.loop.stop();
      }
    }
  }

  function updateGameState(secElapsed) {
    // TODO(irapha): update game state.
  }

  function processInputEvents() {
    var inputEventsCopy = self.inputEvents;
    self.inputEvents = [];

    while (inputEventsCopy.length > 0) {
      var inputEvent = inputEventsCopy.shift();

      // TODO(irapha): Handle inputEvent.

    }
  }

  function checkGameOver(gameOverCb, gameNotOverCb) {
    var gameOver = false;

    // TODO(irapha): Actually check if the game is over.

    if (gameOver) {
      var winner = 'player';
      gameOverCb(winner);
    } else {
      gameNotOverCb();
    }
  }

  function handleGameOver(winner) {
    // TODO(irapha): handle end state.

    self.loop.stop();
  }

  // Public methods.

  this.input = function(inputEvent) {
    self.inputEvents.push(inputEvent);
  }

  this.claimPlayerPlanet = function(planet) {
    planet.owner = 'player';
    planet.population = 100;
    gc.getAiController().claimPlanet();
  }

  this.claimAiPlanet = function(planet) {
    planet.owner = 'ai';
    planet.population = 100;
    gameReady();
  }

  this.getCosmosController = function() {
    return this.cosmosController;
  }

  this.toStr = function() {
    return 'GameplayController';
  }

  // Constructor.

  var self = this;
  var gc = gameController;
  var lc = gc.getLoggingController();

  this.cosmosController = new CosmosController(gc);
  this.inputEvents = [];
  this.loop = null;

  lc.log(self, 'Initialized.');
}
