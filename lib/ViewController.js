function ViewController(gameController) {
  this.gameController = gameController;

  this.planets = {};

  // Private helper functions.

  function getPlanetId(planetElement) {
    return planetElement.attr('id');
  }

  // Public functions.

  this.initialDraw = function(planetList) {
    this.drawPlanets(planetList, this.bindPlanets);
    this.bindViewport();
  }

  this.drawPlanets = function(planetList, cb) {
    for (var planet in planetList) {
      this.gameController.getViewport()
        .append('<div class="planet grey" id="' + planet.id + '" align="center">'  //TODO(irapha): put alignment in css.
                '<div class="population-wrapper"></div>'
                '<div class="pie-wrapper">'
                  '<div class="pie pie-spinner-blue"></div>'
                  '<div class="pie pie-filler-blue"></div>'
                  '<div class="pie-mask-blue"></div>'
                  '<div class="pie pie-spinner-red"></div>'
                  '<div class="pie pie-filler-red"></div>'
                  '<div class="pie-mask-red"></div>'
                '</div>'
              '</div>');

      this.planets[planet.id] = $('#' + planet.id);

      this.planets[planet.id].css('left', (planet.x - 15));
      this.planets[planet.id].css('top', (planet.y - 15));
    }

    cb();
  }

  this.bindPlanets = function() {
    $(".planet").click(function(event) {
       event.stopPropagation();  // Prevents click from reaching viewport.
       planetId = getPlanetId($(this));
       planets[planetId].click();
     });
  }

  this.bindViewport = function() {
    $("#viewport").click(function() {
      this.gameController.deselectPlanets();
    });
  }
}
