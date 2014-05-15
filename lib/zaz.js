'use strict';

/**
 * Dependencies
 */
var util = require('util');
var EventEmitter = require('events').EventEmitter;
var _ = require('lodash');
var async = require('async');
var Deployment = require('./deployment');
var Prelog = require('./prelog');

module.exports = Zaz;

function Zaz(config) {
  if (!(this instanceof Zaz))
    return new Zaz(config);

  this._config = config || {};

  EventEmitter.call(this);
}

util.inherits(Zaz, EventEmitter);

Zaz.prototype.deploy = function() {
  var self = this;

  async.each(this._config.hosts, function(host, cb) {
    var config = _.cloneDeep(self._config);
    delete(config.hosts);
    config.host = host;

    var deployment = new Deployment(config);

    deployment.on('end', function(err) {
      cb(err);
    });
    
    var prelog = new Prelog('\n' + host + ': ');
    
    deployment.pipe(prelog).pipe(process.stdout);
  }, function(err) {
    if (err)
      console.error('Failed: ' + err);
    else
      console.info('Deployed successfully!');
  });
};
