function AiPlanetPicker(gameController) {
  // Private methods.

  function getPointToLineDistance(point, line) {
    return ((Math.abs((line.vector.y - line.origin.y) * point.x -
                      (line.vector.x - line.origin.x) * point.y +
                       line.vector.x * line.origin.y -
                       line.vector.y * line.origin.x)) /
            (Math.pow((Math.pow(line.vector.y - line.origin.y, 2) +
                       Math.pow(line.vector.x - line.origin.x, 2)),
                      0.5)));
  }

  function getLineScore(line, planets, cb) {
    var inequalityScore = 0;
    var separationScore = 0;

    getInequalityScore();

    // inequalityScore decreases as # planets on each side become more unequal.
    function getInequalityScore() {
      dividePlanets(line, planets, afterPlanetsDivided);
    }

    function afterPlanetsDivided(side1, side2) {
      inequalityScore -= Math.abs(side1.length - side2.length) / planets.length;
      getSeparationScore();
    }

    // separationScore increases with higher distances from points to line.
    function getSeparationScore() {
      var vc = gc.getViewController();
      var maxDistanceToLine = Math.sqrt(
          Math.pow(vc.getLevelHeightMinusMargins(), 2) +
          Math.pow(vc.getLevelWidthMinusMargins(), 2)) / 2;
      for (var i in planets) {
        var planet = planets[i];

        var distanceToLine = getPointToLineDistance(planet, line);
        separationScore += (distanceToLine / maxDistanceToLine);
      }
      separationScore /= planets.length;

      getFinalScore();
    }

    function getFinalScore() {
      cb(inequalityScore + 5 * separationScore);
    }
  }

  function dividePlanets(line, planets, cb) {
    var side1 = [];
    var side2 = [];



    function isSide1(point, line) {
      return Math.sign((line.vector.x - line.origin.x) *
                       (point.y - line.origin.y) -
                       (line.vector.y - line.origin.y) *
                       (point.x - line.origin.x)) == 1;
    }

    for (var i in planets) {
      var planet = planets[i];

      if (isSide1(planet, line)) {
        side1.push(planet);
      } else {
        side2.push(planet);
      }
    }

    cb(side1, side2);
  }

  function toRadians(angle) {
    return angle * (Math.PI / 180);
  }

  function divideCosmos(planets, cb) {
    // Find line that best separates planets.
    var bestLine = null;
    var bestLineScore = - Infinity;
    var vc = gc.getViewController();
    var origin = {
      x: (vc.getLevelWidth() / 2),
      y: (vc.getLevelHeight() / 2)
    };

    for (var theta = 0; theta < 180; theta += 5) {
      var currentLine = {
        origin: origin,
        vector: {
          x: Math.cos(toRadians(theta)),
          y: Math.sin(toRadians(theta))
        }
      };

      var currentLineScore = getLineScore(currentLine, planets,
          updateLineScore);

      function updateLineScore(currentLineScore) {
        if (currentLineScore > bestLineScore) {
          bestLine = currentLine;
          bestLineScore = currentLineScore;
        }
      }
    }

    cb(bestLine);
  }

  function pickPlanetFromOppositeSide(planets, bestLine, cb) {
    // Pick a planet from side opposite to player's planet.
    dividePlanets(bestLine, planets, determineOppositeSide);

    function determineOppositeSide(side1, side2) {
      var playerIsSide1 = false;

      for (var i in side1) {
        var planet = side1[i];

        if (planet.owner == 'player') {
          playerIsSide1 = true;
          break;
        }
      }

      if (playerIsSide1) {
        pickRandomFromSide(side2);
      } else {
        pickRandomFromSide(side1);
      }
    }

    function pickRandomFromSide(side) {
      cb(side[Math.floor(Math.random() * side.length)]);
    }
  }

  // Public methods.

  this.toStr = function() {
    return 'AiPlanetPicker';
  }

  this.pickPlanet = function(planets, cb) {
    lc.log(self, 'Dividing cosmos into two sides.');
    divideCosmos(planets, afterCosmosDivided);

    function afterCosmosDivided(bestLine) {
      lc.log(self, 'Picking random from side opposite to player.');
      pickPlanetFromOppositeSide(planets, bestLine, cb);
    }
  }

  var self = this;
  var gc = gameController;
  var lc = gc.getLoggingController();

  lc.log(self, 'Initialized.');
}
