var GROWTH_RATE = 1.02;
var MAX_POPULATION = 100000;
var distance;


function getPlanetPopulations(giver, receiver){
  distance_x = giver.x - receiver.x;
  distance_y = giver.y - receiver.y;

  distance_x_sq = distance_x * distance_x;
  distance_y_sq = distance_y * distance_y;

  distance = Math.sqrt(distance_x_sq + distance_y_sq);

  var giverPopulation = giver.population-(giver.population/(10*distance));

  var receiverPopulation = receiver.population+(giver.population/(10*distance));

  return [giverPopulation, receiverPopulation];
}

function getNaturalGrowth(planetId){
  planet = planets[planetId];
  return planet.population*GROWTH_RATE;
}
