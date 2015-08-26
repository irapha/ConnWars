function Planet(id, x, y, gameController) {
  this.id = id;
  this.population = 0;
  this.x = x;
  this.y = y;
  this.color = 'grey';
  this.inChaos = false;

  this.gameController = gameController;

  this.updatePopulation = function() {

  }

  this.click = function() {
    this.gameController.getPlayerController().clickPlanet(this);
  }
}
