var GROWTH_RATE = 0.002;
var DEPLETION_RATE = 0.9998
var MAX_POPULATION = 1000;
var distance;
var maxDistance = Math.sqrt((levelWidth*levelWidth + levelHeight*levelHeight));
var KAY = 0.6;

function getNumBabies(population) {
  return population + 0.6*(Math.pow(((1000 - 80)/((1000 - 100))), 33/600)*population - population);
}

function getPlanetPopulations(giver, receiver, giverPopInFirebase){
  distance_x = giver.x - receiver.x;
  distance_y = giver.y - receiver.y;
  distance_x_sq = distance_x * distance_x;
  distance_y_sq = distance_y * distance_y;
  distance = Math.sqrt(distance_x_sq + distance_y_sq);
  var giverPop;

  if(giverPopInFirebase === undefined) {
    giverPop = giver.population;
  } else {
    giverPop = giverPopInFirebase;
  }

  var numTransferred = (Math.pow((getNumBabies(giverPop) - giverPop), 2)*KAY)/Math.pow((distance/maxDistance), 2);

  if(giverPop < 12) {
    numTransferred = 0.016;
  }

  var giverPopulation = giverPop - numTransferred;
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

function getNaturalGrowth(planetId, planetPopInFirebase){
  planet = planets[planetId];

  if (planetPopInFirebase === undefined) {
    var planetPopulation = planet.population;
  } else {
    var planetPopulation = planetPopInFirebase;
  }

  if(planet.inChaos){
    return planetPopulation * DEPLETION_RATE;
  }

  newPopulation = getNumBabies(planetPopulation);

  if(newPopulation > 999){
    return 1000;
  }

  return newPopulation
}
