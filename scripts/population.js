var GROWTH_RATE = 0.002;
var DEPLETION_RATE = 0.9998
var MAX_POPULATION = 1000;
var distance;

//problems: grey planets tha won't turn
//small pops wont go down. is it too big a nat growth?

function getPlanetPopulations(giver, receiver){
  distance_x = giver.x - receiver.x;
  distance_y = giver.y - receiver.y;
  distance_x_sq = distance_x * distance_x;
  distance_y_sq = distance_y * distance_y;
  distance = Math.sqrt(distance_x_sq + distance_y_sq);

  var numTransferred = (0.2)*Math.atan(distance + giver.population);

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

  //this works so beautifully. Nevur change pls
  newPopulation = planet.population + Math.pow(((1000000 - 10)/((1000000 - 500)*planet.population)), 33/100);

  if(newPopulation > 999){
    return 1000;
  }

  return newPopulation
}
