'use strict';

/**
 * Dependencies
 */
var util = require('util');
var Transform = require('stream').Transform;
var path = require('path');
require('colors');

module.exports = Symlink;

function Symlink(destination, ssh) {
  if (!(this instanceof Symlink))
    return new Symlink(destination, ssh);

  this._destination = destination;
  this._ssh = ssh;

  Transform.call(this);
  
  var self = this;
  var tmpFolder = path.join(this._destination, 'tmp');
  var logFolder = path.join(this._destination, 'log');
  this._ssh.exec('cd ' + this._destination + ' && rm -rf '
    + tmpFolder
    + ' '
    + logFolder
    + ' && ln -s ../../shared/tmp && ln -s ../../shared/log', function(err, stream) {
    if (err)
      throw err;

    stream.on('data', function(data, type) {
      data = data.toString().replace(/^\s+|\s+$/g, '');
      self.push(data[(type === 'stderr' ? 'red' : 'green')]);
    });

    stream.on('end', function() {
      self.emit('symlinked');
      self.push(null);
    });
  });
}

util.inherits(Symlink, Transform);

Symlink.prototype._transform = function(chunk, enc, cb) {
  this.push(chunk, enc);  
  
  cb();
};