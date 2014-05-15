'use strict';

/**
 * Dependencies
 */
var util = require('util');
var Transform = require('stream').Transform;
var path = require('path');

module.exports = Clone;

function Clone(repository, destination, ssh) {
  if (!(this instanceof Clone))
    return new Clone(destination, ssh);

  this._repository = repository;
  this._destination = destination || '/tmp';
  this._ssh = ssh;

  Transform.call(this);
  
  var self = this;
  var folder = this._destination;
  var release = new Date().getTime();
  this._ssh.exec('cd '
    + path.join(folder, 'releases')
    + ' && git clone ' + repository + ' ' + release, function(err, stream) {
    if (err)
      throw err;

    stream.on('data', function(data, type) {
      data = data.toString().replace(/^\s+|\s+$/g, '');
      self.push(data[(type === 'stderr' ? 'red' : 'green')]);
    });

    stream.on('end', function() {
      self.emit('cloned', release);
      self.push(null);
    });
  });
}

util.inherits(Clone, Transform);

Clone.prototype._transform = function(chunk, enc, cb) {
  this.push(chunk, enc);  
  
  cb();
};