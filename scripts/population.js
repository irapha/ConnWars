var GROWTH_RATE = 0.002;
var DEPLETION_RATE = 0.9998
var MAX_POPULATION = 1000;
var distance;
var maxDistance = Math.sqrt((levelWidth*levelWidth + levelHeight*levelHeight));
var KAY = 0.6;

function getNumBabies(population) {
  return population + 0.6*(Math.pow(((1000 - 80)/((1000 - 100))), 33/600)*population - population);
}

function getPlanetPopulations(giver, receiver){
  distance_x = giver.x - receiver.x;
  distance_y = giver.y - receiver.y;
  distance_x_sq = distance_x * distance_x;
  distance_y_sq = distance_y * distance_y;
  distance = Math.sqrt(distance_x_sq + distance_y_sq);

  var numTransferred = (Math.pow((getNumBabies(giver.population) - giver.population), 2)*KAY)/Math.pow((distance/maxDistance), 2);

  if(giver.population < 12) {
    numTransferred = 0.016;
  }

  var giverPopulation = giver.population - numTransferred;
  var receiverPopulation;

  if(giver.color === receiver.color || receiver.color.toLowerCase() === "grey".toLowerCase()){
    receiverPopulation = receiver.population + numTransferred;
  }else {
    receiverPopulation = receiver.population - numTransferred;
  }

  if(giverPopulation > 999){
    giverPopulation = 1000;
  }

  if(receiverPopulation > 999){
    receiverPopulation = 1000;
  }

  return [giverPopulation, receiverPopulation];
}

function getNaturalGrowth(planetId){
  planet = planets[planetId];

  if(planet.inChaos){
    return planet.population * DEPLETION_RATE;
  }

  newPopulation = getNumBabies(planet.population);

  if(newPopulation > 999){
    return 1000;
  }

  return newPopulation
}
