'use strict';

/**
 * Dependencies
 */
var util = require('util');
var Transform = require('stream').Transform;
var path = require('path');
require('colors');

module.exports = Restart;

function Restart(destination, ssh) {
  if (!(this instanceof Restart))
    return new Restart(destination, ssh);

  this._destination = destination;
  this._ssh = ssh;

  Transform.call(this);
  
  var self = this;
  var folder = this._destination;
  this._ssh.exec('cd '
    + folder
    + ' && ((npm --production run status && npm --production run deploy) || npm --production start)', function(err, stream) {
    if (err)
      throw err;

    stream.on('data', function(data, type) {
      data = data.toString().replace(/^\s+|\s+$/g, '');
      self.push(data[(type === 'stderr' ? 'red' : 'green')]);
    });

    stream.on('end', function() {
      self.emit('restarted');
      self.push(null);
    });
  });
}

util.inherits(Restart, Transform);

Restart.prototype._transform = function(chunk, enc, cb) {
  this.push(chunk, enc);  
  
  cb();
};