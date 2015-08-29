function LevelCreator(gameController) {
  // Private methods.

  function getRandomArbitrary(min, max) {
    return Math.random() * (max - min) + min;
  }

  function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  function initializeProbabilityArray(height, width, cb) {
    var probabilities = [];

    for (var i = 0; i < height; i++) {
      probabilities.push([]);

      for (var j = 0; j < width; j++) {
        probabilities[i].push([1]);
      }
    }

    cb(probabilities);
  }

  function removeProbabilitiesBorders(probabilities, cb) {
    var border = 50;

    for (var i = 0; i < probabilities.length; i++) {
      for (var j = 0; j < probabilities[0].length; j++) {
        if (i < border
            || i > (probabilities.length - border)
            || j < border
            || j > (probabilities[0].length - border)) {
          probabilities[i][j] = 0;
        }
      }
    }

    cb(probabilities);
  }

  function generatePlanetLocations(planetDensity, probabilities, cb) {
    var vc = gc.getViewController();
    var probabilityCap = 3.0;
    var planetLocations = [];
    var numberOfPlanets = (planetDensity * vc.getLevelHeight() *
        vc.getLevelWidth());

    function callGeneratePlanetLocation() {
      generatePlanetLocation(probabilities, probabilityCap,
          afterPlanetLocationGenerated);
    }

    function afterPlanetLocationGenerated(planetLocation) {
      planetLocations.push(planetLocation);

      // TODO(irapha): modify probabilities accordingly.
      // Take probability cap into acc.

      if (planetLocations.length < numberOfPlanets) {
        callGeneratePlanetLocation();
      } else {
        cb(planetLocations);
      }
    }

    callGeneratePlanetLocation();
  }

  function generatePlanetLocation(probabilities, probabilityCap, cb) {
    var maxX = probabilities[0].length;
    var maxY = probabilities.length;

    var planetPosition = {
      x: getRandomInt(0, maxX),
      y: getRandomInt(0, maxY)
    };

    var randomNum = getRandomArbitrary(0, probabilityCap);
    var probability = probabilities[planetPosition.y][planetPosition.x];

    if (randomNum < probability) {
      cb(planetPosition);
    } else {
      generatePlanetLocation(probabilities, probabilityCap, cb);
    }
  }

  // Public methods.

  this.toStr = function() {
    return 'LevelCreator';
  }

  this.createLevel = function(planetDensity, cb) {
    var vc = gc.getViewController();
    lc.log(self, 'Creating level.');

    initializeProbabilityArray(vc.getLevelHeight(), vc.getLevelWidth(),
        afterProbabilityArrayInitialized);

    function afterProbabilityArrayInitialized(probabilities) {
      removeProbabilitiesBorders(probabilities, afterProbabilityBordersRemoved);
    }

    function afterProbabilityBordersRemoved(probabilities) {
      generatePlanetLocations(planetDensity, probabilities,
          afterPlanetLocationsGenerated);
    }

    function afterPlanetLocationsGenerated(planetLocations) {
      cb(planetLocations);
    }
  }

  var self = this;
  var gc = gameController;
  var lc = gc.getLoggingController();

  lc.log(self, 'Initialized.');
}
