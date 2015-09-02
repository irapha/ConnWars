function ViewController(gameController) {
  // Private methods.

  function getPlanetElementId(planet) {
    return 'planet' + planet.id;
  }

  function getPlanetId(planetElement) {
    return Number(extractPlanetElementId(planetElement).replace('planet', ''));
  }

  function getPlanetElement(planetElementId) {
    return self.planets[planetElementId];
  }

  function extractPlanetElementId(planetElement) {
    return planetElement.attr('id');
  }

  function addPlanetElement(planetElementId, planetElement) {
    self.planets[planetElementId] = planetElement;
  }

  function initialPlanetDraw(planetList, cb) {
    lc.log(self, 'Drawing planets.');

    for (var i in planetList) {
      var planet = planetList[i];
      var planetElementId = getPlanetElementId(planet);

      self.getViewport()
        .append('<div class="planet grey" id="' + planetElementId + '">' +
                '<div class="population-wrapper"></div>' +
                '<div class="pie-wrapper">' +
                  '<div class="pie pie-spinner-blue"></div>' +
                  '<div class="pie pie-filler-blue"></div>' +
                  '<div class="pie-mask-blue"></div>' +
                  '<div class="pie pie-spinner-red"></div>' +
                  '<div class="pie pie-filler-red"></div>' +
                  '<div class="pie-mask-red"></div>' +
                '</div>' +
              '</div>');

      addPlanetElement(planetElementId, $('#' + planetElementId));

      getPlanetElement(planetElementId).css('left', (planet.x - 15));
      getPlanetElement(planetElementId).css('top', (planet.y - 15));
    }

    cb();
  }

  function bindPlanets() {
    lc.log(self, 'Binding planet click events.');

    $(".planet").click(function(event) {
       event.stopPropagation();  // Prevents click from reaching viewport.
       planetId = getPlanetId($(this));
       gc.getPlayerController()
         .clickPlanet(planetId);
     });
  }

  function bindViewport() {
    lc.log(self, 'Binding viewport click events.');

    self.getViewport().click(function() {
      gc.getPlayerController().deselectPlanets();
    });
  }

  // Public methods.

  this.initialDraw = function(planetList) {
    lc.log(self, 'Initial draw.');
    initialPlanetDraw(planetList, bindPlanets);
    bindViewport();
  }

  this.render = function(interpolationPercentage) {
    // TODO(irapha): render the game with an extrapolation of lag ms into
    // the future.
  }

  this.getViewport = function() {
    return this.viewport;
  }

  this.getLevelWidth = function() {
    return this.getViewport().width();
  }

  this.getLevelHeight = function() {
    return this.getViewport().height();
  }

  this.getPlanetPositions = function(planetDensity, cb) {
    levelCreator.createLevel(planetDensity, cb);
  }

  this.toStr = function() {
    return 'ViewController';
  }

  // Constructor.

  var self = this;
  var gc = gameController;
  var lc = gc.getLoggingController();

  var levelCreator = new LevelCreator(gc);

  this.planets = {};
  this.viewport = $('#viewport');

  lc.log(self, 'Initialized.');
}
