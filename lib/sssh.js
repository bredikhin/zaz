'use strict';

/**
 * Dependencies
 */
var util = require('util');
var Transform = require('stream').Transform;
var path = require('path');
require('colors');

module.exports = Sssh;

function Sssh(ssh, command) {
  if (!(this instanceof Sssh))
    return new Sssh(ssh, command);

  Transform.call(this);
  
  var self = this;
  if (command) {
    ssh.exec(command, function(err, stream) {
      if (err)
        throw err;

      stream.on('data', function(data, type) {
        data = data.toString().replace(/^\s+|\s+$/g, '');
        self.push(data[(type === 'stderr' ? 'red' : 'green')]);
      });

      stream.on('end', function() {
        self.push(null);
      });
    });
  }
  else {
    this.push(null);
  }
}

util.inherits(Sssh, Transform);

Sssh.prototype._transform = function(chunk, enc, cb) {
  this.push(chunk, enc);  
  
  cb();
};