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

      // Create planetView Container.
      var planetView = new createjs.Container();
      // Set planetView location.
      planetView.x = planet.x;
      planetView.y = planet.y;
      planetView.name = 'planetView';

      // Create planetBorderView.
      var planetBorderView = new createjs.Shape();
      planetBorderView.graphics
        .beginFill('#FFFFFF')
        .drawCircle(0, 0, self.planetRadius + 3)
        .endFill();
      planetBorderView.alpha = 0;
      planetBorderView.name = 'planetBorderView';

      planetView.addChild(planetBorderView);

      // Create planetBodyView.
      var planetBodyView = new createjs.Shape();
      planetBodyView.graphics
        .beginFill(self.grey)
        .drawCircle(0, 0, self.planetRadius)
        .endFill();
      planetBodyView.name = 'planetBodyView';

      planetView.addChild(planetBodyView);

      // Create population text view.
      var populationView = new createjs.Text('',
          '48x Helvetica', '#FFFFFF');
      populationView.textAlign = 'center';
      populationView.textBaseline = 'middle';
      populationView.name = 'populationView';

      planetView.addChild(populationView);

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
      var planetId = self.planets[event.target.parent.id].id
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

  function getPlanetScale(population) {
    // Population ranges from 0 to 1000.
    // In this range, scale goes from 1 to 3.
    // This makes planet sizes range from 30px to 90px.
    // The scale function has a higher slope in the beginning.
    // This makes early game still feel like progression,
    // even if population doesn't grow as much.

    if (population > 0) {
      return (Math.pow(population, 1/2) / 15.8) + 1;
    } else {
      return 1;
    }
  }

  function updatePlanetBodyViewColor(planet, planetView) {
    var color = self.grey;

    if (planet.owner == 'player') {
      color = self.blue;
    } else if (planet.owner == 'ai') {
      color = self.orange;
    }

    planetView.getChildByName('planetBodyView').graphics
      .clear()
      .beginFill(color)
      .drawCircle(0, 0, self.planetRadius)
      .endFill();

    planetView.getChildByName('planetBorderView').alpha = 0;
  }

  function updatePlanetViewScale(planet, planetView) {
    var scale = getPlanetScale(planet.population);
    planetView.scaleX = scale;
    planetView.scaleY = scale;
  }

  function updatePopulationView(planet, planetView) {
    if (planet.population >= 2) {
      planetView.getChildByName('populationView')
        .text = String(Math.round(planet.population));
    } else {
      planetView.getChildByName('populationView').text = '';
    }
  }

  function displaySelectedPlanet() {
    var selectedPlanet = gc.getPlayerController().selectedPlanet;
    if (selectedPlanet !== null) {
      var planetView = self.planetViews[selectedPlanet.id];
      planetView.getChildByName('planetBorderView').alpha = 1;
    }
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

    // Update planets.
    for (var planetViewId in self.planets) {
      var planet = self.planets[planetViewId];
      var planetView = self.planetViews[planet.id];

      // Update color.
      updatePlanetBodyViewColor(planet, planetView);

      // Update population.
      updatePopulationView(planet, planetView);

      // Update scaling.
      updatePlanetViewScale(planet, planetView);
    }

    // Update connections (connecting and connected).
    // TODO

    // Display selection border around selectedPlanet.
    displaySelectedPlanet();

    // Refresh canvas.
    self.stage.update();
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
  this.planetRadius = 15;  // px.

  var canvasHeight = $(window).height() - 25;
  var canvasWidth = $(window).width() - 20;

  lc.log(self, 'Initializing viewport.');
  this.viewport = $('#viewport');
  this.viewport.attr('height', canvasHeight);
  this.viewport.attr('width', canvasWidth);

  lc.log(self, 'Initializing stage.');
  this.stage = new createjs.Stage('viewport');

  lc.log(self, 'Loading assets.');
  this.blueConnectorLeft = new createjs.Bitmap('images/blue_line_left.gif');
  this.blueConnectorRight = new createjs.Bitmap('images/blue_line_right.gif');
  this.orangeConnectorLeft = new createjs.Bitmap('images/orange_line_left.gif');
  this.orangeConnectorRight = new createjs.Bitmap('images/orange_line_right.gif');

  lc.log(self, 'Initializing stage background.');
  this.background = new createjs.Shape();
  this.background.graphics.dr(0, 0, canvasWidth, canvasHeight);
  this.stage.addChild(this.background);

  lc.log(self, 'Initialized.');
}
