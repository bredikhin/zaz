'use strict';

/**
 * Dependencies
 */
var util = require('util');
var Transform = require('stream').Transform;
var path = require('path');
require('colors');

module.exports = Folders;

function Folders(destination, ssh) {
  if (!(this instanceof Folders))
    return new Folders(destination, ssh);

  this._path = destination || '/tmp';
  this._ssh = ssh;

  Transform.call(this);
  
  var self = this;
  var folder = this._path;
  this._ssh.exec('mkdir -p '
    + path.join(folder, 'releases')
    + ' ' + path.join(folder, 'shared', 'log')
    + ' ' + path.join(folder, 'shared', 'tmp'), function(err, stream) {
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

util.inherits(Folders, Transform);

Folders.prototype._transform = function(chunk, enc, cb) {
  this.push(chunk, enc);  
  
  cb();
};