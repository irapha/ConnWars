var GROWTH_RATE = 1.0002;
var DEPLETION_RATE = 0.9998
var MAX_POPULATION = 100000;
var distance;


function getPlanetPopulations(giver, receiver){
  distance_x = giver.x - receiver.x;
  distance_y = giver.y - receiver.y;

  distance_x_sq = distance_x * distance_x;
  distance_y_sq = distance_y * distance_y;

  distance = Math.sqrt(distance_x_sq + distance_y_sq);

  var numTransferred = (0.03)*(-1)*Math.atan(distance*(-1) - giver.population);

  var giverPopulation = giver.population - numTransferred;

  var receiverPopulation;

  if(giver.color === receiver.color || receiver.color.toLowerCase() === "grey".toLowerCase()){
    receiverPopulation = receiver.population + numTransferred;
  }

  else{
    receiverPopulation = receiver.population - numTransferred;
  }

  if(giverPopulation > 1000000){
    giverPopulation = 1000000;
  }

  if(receiverPopulation > 1000000){
    receiverPopulation = 1000000;
  }

  return [giverPopulation, receiverPopulation];
}

function getNaturalGrowth(planetId){
  planet = planets[planetId];

  /*
  t is a time variable. This code is commented to prevent disturbance with existing code in main.js. Must confer to determine how to best find time since initial population
  return 1000000/(1 + (Math.pow(Math.E, -1*t))
  */
  if(planet.inChaos){
    return planet.population*DEPLETION_RATE;
  }

  if(planet.population*GROWTH_RATE > 1000000){
    return 1000000;
  }


  return planet.population*GROWTH_RATE;
}
