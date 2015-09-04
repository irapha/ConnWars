function ViewController(gameController) {
  // Private methods.

  function addPlanetAndPlanetView(planet, planetView) {
    self.planets[planetView.id] = planet;
    self.planetViews[planet.id] = planetView;
  }

  function initialPlanetDraw(planetList, cb) {
    lc.log(self, 'Drawing planets.');

    for (var i in planetList) {
      var planet = planetList[i];

      // Create grey planet shape.
      var planetView = new createjs.Shape();
      planetView.graphics
        .beginFill(self.grey)
        .drawCircle(0, 0, planetRadius);

      planetView.x = planet.x;
      planetView.y = planet.y;

      // self.getViewport()
        // .append('<div class="planet grey" id="' + planetElementId + '">' +
                // '<div class="population-wrapper"></div>' +
                // '<div class="pie-wrapper">' +
                  // '<div class="pie pie-spinner-blue"></div>' +
                  // '<div class="pie pie-filler-blue"></div>' +
                  // '<div class="pie-mask-blue"></div>' +
                  // '<div class="pie pie-spinner-red"></div>' +
                  // '<div class="pie pie-filler-red"></div>' +
                  // '<div class="pie-mask-red"></div>' +
                // '</div>' +
              // '</div>');

      self.stage.addChild(planetView);
      addPlanetAndPlanetView(planet, planetView);
    }

    self.stage.update();

    cb();
  }

  function bindPlanets() {
    lc.log(self, 'Binding planet click events.');

    function planetClickEvent(event) {
      event.stopPropagation();  // Prevents click from reaching background.
      var planetId = self.planets[event.target.id].id
      gc.getPlayerController().clickPlanet(planetId);
    }

    for (var id in self.planetViews) {
      var planetView = self.planetViews[id];
      planetView.on('click', planetClickEvent);
    }
  }

  function bindStageBackground() {
    lc.log(self, 'Binding stage click events.');

    var hit = new createjs.Shape();
    hit.graphics.f('#000').dr(0, 0, canvasWidth, canvasHeight);
    self.background.hitArea = hit;

    self.background.on('mousedown', function(event) {
      if (event.target == self.background) {
        gc.getPlayerController().deselectPlanets();
      }
    });
  }

  // Public methods.

  this.initialDraw = function(planetList) {
    lc.log(self, 'Initial draw.');
    initialPlanetDraw(planetList, bindPlanets);
    bindStageBackground();
  }

  this.render = function(interpolationPercentage) {
    // TODO(irapha): render the game with an extrapolation of lag ms into
    // the future.
  }

  this.getViewport = function() {
    return this.viewport;
  }

  this.getStage = function() {
    return this.stage;
  }

  this.getLevelWidth = function() {
    // Returns width of canvas.
    return this.getViewport().width();
  }

  this.getLevelHeight = function() {
    // Returns height of canvas.
    return this.getViewport().height();
  }

  this.getLevelMargin = function() {
    // Returns margin size around level.
    return 50;  // px
  }

  this.getLevelWidthMinusMargins = function() {
    // Returns width of canvas minus margin.
    return this.getLevelWidth() - (2 * this.getLevelMargin());
  }

  this.getLevelHeightMinusMargins = function() {
    // Returns height of canvas minus margins.
    return this.getLevelHeight() - (2 * this.getLevelMargin());
  }

  this.getPlanetPositions = function(planetDensity, cb) {
    var levelCreator = new LevelCreator(gc);
    levelCreator.createLevel(planetDensity, cb);
  }

  this.toStr = function() {
    return 'ViewController';
  }

  // Constructor.

  var self = this;
  var gc = gameController;
  var lc = gc.getLoggingController();

  this.planets = {};  // key: planetViewId; value: planet;
  this.planetViews = {};  // key: planetId; value: planetView;

  this.grey = '#A2A2A2';
  this.blue = '#4391F7';
  this.orange = '#F26140';

  var canvasHeight = $(window).height() - 25;
  var canvasWidth = $(window).width() - 20;
  var planetRadius = 15;  // px.

  lc.log(self, 'Initializing viewport.');
  this.viewport = $('#viewport');
  this.viewport.attr('height', canvasHeight);
  this.viewport.attr('width', canvasWidth);

  lc.log(self, 'Initializing stage.');
  this.stage = new createjs.Stage('viewport');

  lc.log(self, 'Initializing stage background.');
  this.background = new createjs.Shape();
  this.background.graphics.dr(0, 0, canvasWidth, canvasHeight);
  this.stage.addChild(this.background);

  lc.log(self, 'Initialized.');
}
