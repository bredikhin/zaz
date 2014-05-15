'use strict';

/**
 * Dependencies
 */
var util = require('util');
var Transform = require('stream').Transform;

module.exports = Prelog;

function Prelog(prefix) {
  if (!(this instanceof Prelog))
    return new Prelog(prefix);

  this._prefix = prefix.toString() || '';

  Transform.call(this);
}

util.inherits(Prelog, Transform);

Prelog.prototype._transform = function(chunk, enc, cb) {
  this.push(this._prefix + chunk.toString());
  
  cb();
};