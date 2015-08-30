function LevelCreator(gameController) {
  // Private methods.

  function getRandomArbitrary(min, max) {
    return Math.random() * (max - min) + min;
  }

  function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  function getDistance(p1, p2) {
    return Math.sqrt(Math.pow((p1.x - p2.x), 2) + Math.pow((p1.y - p2.y), 2));
  }

  function generatePlanetLocations(planetDensity, cb) {
    var vc = gc.getViewController();
    var planetLocations = [];
    var numberOfPlanets = (planetDensity * vc.getLevelHeight() *
        vc.getLevelWidth());

    lc.log(self, 'Generating ' + numberOfPlanets + ' planets.');

    function callGeneratePlanetLocation(planetLocations) {
      generatePlanetLocation(planetLocations, afterPlanetLocationGenerated);
    }

    function afterPlanetLocationGenerated(planetLocation) {
      lc.log(self, 'Planet generated (x: ' +
            planetLocation.x + ', y: ' + planetLocation.y + ').');

      planetLocations.push(planetLocation);

      if (planetLocations.length < numberOfPlanets) {
        callGeneratePlanetLocation(planetLocations);
      } else {
        cb(planetLocations);
      }
    }

    callGeneratePlanetLocation(planetLocations);
  }

  function generatePlanetLocation(planetLocations, cb) {
    var maxX = gc.getViewController().getLevelWidth();
    var maxY = gc.getViewController().getLevelHeight();

    var newPlanetLocation = {
      x: getRandomInt(0, maxX),
      y: getRandomInt(0, maxY)
    };

    var randomNum = getRandomArbitrary(0, self.probabilityCap);
    var probability = getProbability(newPlanetLocation, planetLocations);

    if (isNaN(probability) || randomNum >= probability) {
      generatePlanetLocation(planetLocations, cb);
    } else {
      cb(newPlanetLocation);
    }
  }

  function getProbability(newPlanetLocation, planetLocations) {
    var probability = 1;

    for (var i in planetLocations) {
      var planetLocation = planetLocations[i];
      var distance = getDistance(newPlanetLocation, planetLocation);

      if (distance < self.noTouchDist) {
        return NaN;
      } else if (distance < self.lowPointDist) {
        probability += getProbabilityModifier(distance);
      }
    }

    return probability;
  }

  function getProbabilityModifier(distance) {
    // At self.noTouchDist, pMod = +0.5
    // It decreases until it self.lowPoint, where pMod = -0.5.
    var slope = ((-2 * self.probabilityModifier)
      / (self.lowPointDist - self.noTouchDist));
    var b = (self.probabilityModifier +
        (self.noTouchDist / (self.lowPointDist - self.noTouchDist)));
    var pMod = distance * slope + b;
    return pMod;
  }

  // Public methods.

  this.toStr = function() {
    return 'LevelCreator';
  }

  this.createLevel = function(planetDensity, cb) {
    var vc = gc.getViewController();
    lc.log(self, 'Creating level.');

    lc.log(self, 'Generating planet locations.');
    generatePlanetLocations(planetDensity, function(planetLocations) {
      lc.log(self, 'Planet locations generated.');
      cb(planetLocations);
    });
  }

  var self = this;
  var gc = gameController;
  var lc = gc.getLoggingController();

  self.noTouchDist = 100;  // 110 pixels minimum distance between planets.
  self.lowPointDist= 250;  // At 110 dist, +pMod. At 220, -pMod. nothing > 220.
  self.probabilityModifier = 0.7;  // How much is +/-'d in the low/high points.
  self.probabilityCap = 20.0;

  lc.log(self, 'Initialized.');
}
