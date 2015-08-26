function LoggingController() {
  // Public methods.

  this.log = function(that, msg) {
    console.log(that.toStr() + ": " + msg);
  }

  this.toStr = function() {
    return 'LoggingController';
  }

  // Constructor.

  var self = this;
  this.log(self, 'Initialized.');
}
