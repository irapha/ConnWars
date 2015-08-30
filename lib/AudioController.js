function AudioController(loggingController) {
  // Public methods.

  this.play = function() {
    lc.log(self, 'Music play.');
    this.music.play();
    this.playing = true;
    this.button.html('mute');
  }

  this.pause = function() {
    lc.log(self, 'Music pause.');
    this.music.pause();
    this.playing = false;
    this.button.html('unmute');
  }

  this.click = function() {
    if (this.playing) { this.pause(); } else { this.play(); }
  }

  this.toStr = function() {
    return 'AudioController';
  }

  // Constructor.

  var self = this;
  var lc = loggingController;

  this.playing = true;
  this.button = $('#mute-button');
  this.music = $('#soundloop')[0];

  // Binding mute button to handler.
  this.button.click(function() { self.click() });

  lc.log(self, 'Initialized.');
}
