var GROWTH_RATE = 1.02;
var MAX_POPULATION = 100000;
var distance;


function getPlanetPopulations(giver, receiver){
  distance_x = giver.x - receiver.x;
  distance_y = giver.y - receiver.y;

  distance_x_sq = distance_x * distance_x;
  distance_y_sq = distance_y * distance_y;

  distance = Math.sqrt(distance_x_sq + distance_y_sq);

  giver.population = giver.population-(giver.population/(10*distance));

  receiver.population = receiver.population+(giver.population/(10*distance));

  return [giver.population, receiver.population];
  }

function getNaturalGrowth(planet){
  return planet.population*GROWTH_RATE;
}

  var planet1 = { population:100000, x:0, y:0};
  var planet2 = { population:0, x:100, y:100};

  var popsArray;

  for (i = 0; i<20; i++){
    if(i<10){
      popsArray = getPlanetPopulations(planet1, planet2);
      planet1.population = popsArray[0];
      planet2.population = popsArray[1];
    }

    else{
      popsArray = getPlanetPopulations(planet2, planet1);
      planet2.population = popsArray[0];
      planet1.population = popsArray[1];
    }

    console.log("Planet 1: " + planet1.population + " || Planet 2: " + planet2.population);
    console.log("");

  }
