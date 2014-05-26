'use strict';

/**
 * Dependencies
 */
var path = require('path');
var should = require('should');
var _ = require('lodash');
var Transform = require('stream').Transform;
var Deployment = require('../../lib/deployment');
var config = require('../fixtures/zaz.json');
var cwd = process.cwd();
var fixtureFolder = path.join(cwd, 'test', 'fixtures');

describe('Deployment stream', function() {
  before(function(done) {
    process.chdir(fixtureFolder);

    done();
  });

  after(function(done) {
    process.chdir(cwd);

    done();
  });

  it('is a transform stream', function(done) {
    var deployment = new Deployment(config.stages.valid);
    deployment.should.be.an.instanceOf(Transform);

    done();
  });

  describe('has `start` method which', function() {
    describe('verifies the configuration provided and fails', function() {
      it('if the user is missing', function(done) {
        var deployment = new Deployment(config.stages.missingUser);

        deployment.on('error', function(err) {
          err.should.be.an.Error;
          err.message.should.be.eql('Stage configuration is incomplete: the deployment user is missing!');
          
          done();
        });

        deployment.start();
      });

      it('if the Git repository is missing', function(done) {
        var deployment = new Deployment(config.stages.missingGit);

        deployment.on('error', function(err) {
          err.should.be.an.Error;
          err.message.should.be.eql('Stage configuration is incomplete: the source repository is missing!');
          
          done();
        });

        deployment.start();
      });

      it('if the destination path is missing', function(done) {
        var deployment = new Deployment(config.stages.missingPath);

        deployment.on('error', function(err) {
          err.should.be.an.Error;
          err.message.should.be.eql('Stage configuration is incomplete: the destination path is missing!');
          
          done();
        });

        deployment.start();
      });

      it('if the destination host is missing', function(done) {
        var deployment = new Deployment(config.stages.missingHosts);

        deployment.on('error', function(err) {
          err.should.be.an.Error;
          err.message.should.be.eql('Stage configuration is incomplete: the destination host is missing!');
          
          done();
        });

        deployment.start();
      });
    });

    describe('accepts a valid configuration and', function() {
      var deploymentConfig = _.cloneDeep(config.stages.valid);
      deploymentConfig.host = deploymentConfig.hosts[0];
      var deployment;
      var events = [
        'ready',
        'clonable',
        'installable',
        'symlinkable',
        'restartable'
      ];
      
      beforeEach(function(done) {
        deployment = new Deployment(deploymentConfig);

        done();
      });

      it('establishes an SSH connection', function(done) {
        deployment.start();
        should(deployment._ssh).be.Ok;
        
        done();
      });
      
      describe('has', function() {
        beforeEach(function(done) {
          deployment.on('ready', function(err) {
            done();
          });

          deployment.start();
        });
        
        for(var i = 0; i < events.length; i++) {
          var event = events[i];
          it('`' + event + '` event attached', function(done) {
            Object.keys(deployment._events).should.containEql(event);

            done();
          });
        }
      });

      it('fires events in the right sequence', function(done) {
        function closuredTest(j) {
          var event = events[j];
          var previous = events[j-1];
          
          deployment.on(event, function() {
            if (j > 0)
              should(firings[previous]).be.Ok;
            firings[event] = true;

            if (j == events.length-1)
              done();
          });
        }
        
        var firings = {};
        
        for(var i = 0; i < events.length; i++) {
          closuredTest(i);
        }
        
        deployment.start();
      });
    });
  });
});