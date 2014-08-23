var planets = {};
var planetIds = [];
var totalPlanets = 10;
var levelWidth = $(window).width()-100;
var levelHeight = $(window).height()-100;
var viewport = $('#viewport');
var selectedPlanet;

function setupLevel() {
  currentId = 0;
  for(var i=0; i<totalPlanets; i++) {
    var randomX = ~~(levelWidth/2)*Math.random();
    var randomY = ~~(levelHeight)*Math.random();
    var mirrorX = levelWidth-randomX;
    var mirrorY = levelHeight-randomY;
    var planetId = 'planet' + currentId;
    planets[planetId] = {color:'grey', x:randomX, y:randomY, id:planetId, selected:false};
    planetIds.push(planetId);
    viewport.append('<div class="planet grey" id="'+planetId+'"></div>');
    currentId++;

    planetId = 'planet' + currentId;
    planets[planetId] = {color:'grey', x:mirrorX, y:mirrorY, id:planetId, selected:false};
    planetIds.push(planetId);
    viewport.append('<div class="planet grey" id="'+planetId+'"></div>');
    currentId++;
  }

  $('.planet').click(function() {
    planetClicked($(this));
  });
}

function draw() {
  planetIds.forEach(function(planetId) {
    var planet = planets[planetId];
    var planetEl = $('#'+planetId);
    planetEl.css('left', planet.x);
    planetEl.css('top', planet.y);
  });
}

function planetClicked(planetEl) {
  var planetId = planetEl.attr('id');
  var planet = planets[planetId];
  planet.selected = !planet.selected;
  planetEl.toggleClass('selected');
}

setupLevel();
draw();
