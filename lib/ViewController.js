function ViewController(gameController) {
  // Private methods.

  function getPlanetId(planetElement) {
    return planetElement.attr('id');
  }

  function drawPlanets(planetList, cb) {
    lc.log(self, 'Drawing planets.');

    for (var planet in planetList) {
      gc.getViewport()
        .append('<div class="planet grey" id="' + planet.id + '" align="center">' +  //TODO(irapha): put alignment in css.
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

      this.planets[planet.id] = $('#' + planet.id);

      this.planets[planet.id].css('left', (planet.x - 15));
      this.planets[planet.id].css('top', (planet.y - 15));
    }

    cb();
  }

  function bindPlanets() {
    lc.log(self, 'Binding planet click events.');

    $(".planet").click(function(event) {
       event.stopPropagation();  // Prevents click from reaching viewport.
       planetId = getPlanetId($(this));
       planets[planetId].click();
     });
  }

  function bindViewport() {
    lc.log(self, 'Binding viewport click events.');

    $('#viewport').click(function() {
      self.gc.getGameplayController().deselectPlanets();
    });
  }

  // Public methods.

  this.initialDraw = function(planetList) {
    lc.log(self, 'Initial draw.');
    drawPlanets(planetList, bindPlanets);
    bindViewport();
  }

  this.toStr = function() {
    return 'ViewController';
  }

  // Constructor.

  var self = this;
  var gc = gameController;
  var lc = gc.getLoggingController();

  this.planets = {};

  lc.log(self, 'Initialized.');
}
