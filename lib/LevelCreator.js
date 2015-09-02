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

  function BezierCurve(p1, p2, p3) {
    this.p1 = p1;
    this.p2 = p2;
    this.p3 = p3;

    function getTForX(Px) {
      var a = p1.x -2*p2.x + p3.x;
      var b = -2*p1.x + 2*p2.x;
      var c = p1.x - Px;
      var t1 = ((-1*b) + Math.sqrt((b*b) - 4*a*c))/ (2*a);
      var t2 = ((-1*b) - Math.sqrt((b*b) - 4*a*c))/ (2*a);
      return (0 <= t1 && t1 <= 1) ? (t1) : (t2);
    }

    function getYForT(t) {
      return (p1.y -2*p2.y + p3.y) * t * t +
        (-2*p1.y + 2*p2.y) * t + p1.y;
    }

    this.getYForX = function(x) {
      return getYForT(getTForX(x));
    }
  }

  function getPointsForBezierCurves(cb) {
    lc.log(self, 'Creating points for Bezier curves.');

    // Instantiate needed points (in graph below, from left to right).
    var a = {
      x: self.minDistBetweenPlanets,
      y: self.probabilityModifier
    };

    var b = {
      x: a.x + (self.clusterLooseness * self.clusterSize),
      y: a.y
    };

    var c = {
      x: a.x + self.clusterSize,
      y: 0
    };

    var d = {
      x: a.x + ((1 - self.clusterLooseness) * self.clusterSize),
      y: - self.probabilityModifier
    };

    var e = {
      x: (a.x + c.x + self.valleySize + d.x) / 2,
      y: d.y
    };

    var f = {
      x: (3/4 * (a.x + c.x + self.valleySize) + (1/4 * e.x)) / 2,
      y: e.y
    };

    var g = {
      x: (a.x + c.x + self.valleySize + e.x) / 2,
      y: e.y / 2
    };

    var h = {
      x: (1/4 * (a.x + c.x + self.valleySize) + (3/4 * e.x)) / 2,
      y: 0
    };

    var i = {
      x: a.x + c.x + self.valleySize,
      y: 0
    };

    cb(a, b, c, d, e, f, g, h, i);
  }

  function getProbability(newPlanetLocation, planetLocations) {
    var probability = self.baseProbability;

    for (var i in planetLocations) {
      var planetLocation = planetLocations[i];
      var distance = getDistance(newPlanetLocation, planetLocation);

      if (distance < self.minDistBetweenPlanets) {
        return NaN;
      } else if (distance < (self.minDistBetweenPlanets +
                             self.clusterSize +
                             self.valleySize)) {
        probability += getProbabilityModifier(distance);
      }
    }

    return probability;
  }

  function getProbabilityModifier(distance) {
    if (distance < self.highProbabilityCurve.p3.x) {
      return self.highProbabilityCurve.getYForX(distance);
    } else if (distance < self.startOfValley.p3.x) {
      return self.startOfValley.getYForX(distance);
    } else if (distance < self.middleOfValley.p3.x) {
      return self.middleOfValley.getYForX(distance);
    } else if (distance < self.endOfValley.p3.x) {
      return self.endOfValley.getYForX(distance);
    } else {
      lc.log(self, 'WARNING: Returned 0 when calculating probability.');
      return 0;
    }
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

  // Constructor.

  var self = this;
  var gc = gameController;
  var lc = gc.getLoggingController();

  // Probability around a planet (constructed with 4 bezier curves):

  //         ^
  //         cp  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -
  //         |
  //         |
  //         |
  //       / pm -  -   x . . .    x
  //  pm <   |         |       . .
  //       \ |         |           . .
  //         bs -  -  -  -  -  -  -  -  x  -  -  -  -  - +- x  -  -  -
  //       / |         |                 . .           . .  |
  //      |  |         |                    . .     . +     |
  //  bs <   pm -  -  -  -  -  -  -  -  -  - +- .+. -+ -  -  -  -  -  -
  //      |  |         |                                    |
  //       \ | NaNaNaN |                                    |
  //         +--------min--------cls---csz-----------------vln---------
  //         \________/\_______________/\__________________/
  //            min           csz               vln

  // x = control points you can modify.
  // + = control points auto generated.

  // cp: probabilityCap - max probability possible.
  // bs: baseProbability - initial probability at every point.
  // pm: probabilityModifier - the max value added/subtracted from base.
  // min: minDistBetweenPlanets.
  // csz: clusterSize - where probability starts to become lower than base.
  // cls: clusterLooseness - how tight (0) or loose (1) clusters should be.
  // vln: valleySize - where probability stops being modified.

  self.baseProbability = 1;
  self.probabilityCap = 20.0;
  self.probabilityModifier = 0.7;

  self.minDistBetweenPlanets = 100;
  self.clusterSize = 50;
  self.valleySize = 100;
  self.clusterLooseness = 0.7;

  getPointsForBezierCurves(function(a, b, c, d, e, f, g, h, i) {
    lc.log(self, 'Creating Bezier curves.');
    // Create Bezier Curves using those points.
    self.highProbabilityCurve = new BezierCurve(a, b, c);
    self.startOfValley = new BezierCurve(c, d, e);
    self.middleOfValley = new BezierCurve(e, f, g);
    self.endOfValley = new BezierCurve(g, h, i);
  });

  lc.log(self, 'Initialized.');
}
