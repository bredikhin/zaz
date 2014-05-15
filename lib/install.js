'use strict';

/**
 * Dependencies
 */
var util = require('util');
var Transform = require('stream').Transform;
var path = require('path');
require('colors');

module.exports = Install;

function Install(destination, ssh) {
  if (!(this instanceof Install))
    return new Install(destination, ssh);

  this._destination = destination;
  this._ssh = ssh;

  Transform.call(this);
  
  var self = this;
  var folder = this._destination;
  this._ssh.exec('cd '
    + folder
    + ' && npm install --loglevel error', function(err, stream) {
    if (err)
      throw err;

    stream.on('data', function(data, type) {
      data = data.toString().replace(/^\s+|\s+$/g, '');
      self.push(data[(type === 'stderr' ? 'red' : 'green')]);
    });

    stream.on('end', function() {
      self.emit('installed');
      self.push(null);
    });
  });
}

util.inherits(Install, Transform);

Install.prototype._transform = function(chunk, enc, cb) {
  this.push(chunk, enc);  
  
  cb();
};