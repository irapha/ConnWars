var planets = [];
var planetsPerSide = 10;
var levelWidth = $(window).width()-100;
var levelHeight = $(window).height()-100;
var viewport = $('#viewport');

function setupLevel() {
  for(var i=0; i<planetsPerSide; i++) {
    var randomX = ~~(levelWidth/2)*Math.random();
    var randomY = ~~(levelHeight)*Math.random();
    var mirrorX = levelWidth-randomX;
    var mirrorY = levelHeight-randomY;
    planets.push({side:'red', x:randomX, y:randomY});
    planets.push({side:'blue', x:mirrorX, y:mirrorY});
  }
}

function draw() {
  var currentId = 0;
  planets.forEach(function(planet) {
    viewport.append('<div class="planet '+planet.side+'" id="planet'+currentId+'"></div>');
    planet.id = 'planet'+currentId;
    var planetEl = $('#'+planet.id);
    planetEl.css('left', planet.x);
    planetEl.css('top', planet.y);
    currentId++;
  });
}

setupLevel();
draw();
