'use strict';

/**
 * Dependencies
 */
var util = require('util');
var EventEmitter = require('events').EventEmitter;
var _ = require('lodash');
var path = require('path');
var readJson = require('jsonfile').readFile;
var async = require('async');
var Deployment = require('./deployment');
var Prelog = require('prelog');

module.exports = Zaz;

function Zaz(stage) {
  if (!(this instanceof Zaz))
    return new Zaz(stage);

  this._stage = stage;
  
  EventEmitter.call(this);
}

util.inherits(Zaz, EventEmitter);

Zaz.prototype.deploy = function(done) {
  var self = this;

  readJson(path.join(process.cwd(), 'zaz.json'), function(err, config) {
    if (err)
      return done(new Error('Configuration file (`zaz.json`) not found!'));
    else {
      var stageConfig = config.stages[self._stage];
      if (!stageConfig)
        return done(new Error('Requested stage (`' + self._stage + '`) not found!'));

      if (!stageConfig.user)
        return done(new Error('Stage configuration is incomplete: the deployment user is missing!'));

      if (!stageConfig.git)
        return done(new Error('Stage configuration is incomplete: the source repository is missing!'));

      if (!stageConfig.path)
        return done(new Error('Stage configuration is incomplete: the destination path is missing!'));
      
      if (!stageConfig.hosts)
        return done(new Error('Stage configuration is incomplete: the host list is missing!'));
      
      if (!stageConfig.hosts.length)
        return done(new Error('Stage configuration is incomplete: the host list is empty!'));

      async.each(stageConfig.hosts, function(host, cb) {
        var config = _.cloneDeep(stageConfig);
        delete(config.hosts);
        config.host = host;

        var deployment = new Deployment(config);

        deployment.on('error', function(err) {
          cb(err);
        });

        deployment.on('end', function(err) {
          cb(err);
        });

        var prelog = new Prelog('\n' + host + ': ');

        deployment.pipe(prelog).pipe(process.stdout);

        deployment.start();
      }, function(err) {
        if (err) {
          done(err);
        }
        else
          done();
      });
    }
  });
};
