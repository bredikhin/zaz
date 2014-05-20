'use strict';

/**
 * Dependencies
 */
var path = require('path');
var should = require('should');
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

    describe('attaches', function() {
      it('a `ready` event');

      it('a `clonable` event');

      it('a `installable` event');

      it('a `symlinkable` event');

      it('a `restartable` event');
    });

    it('establishes SSH connection');
  });
});