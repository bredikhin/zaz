'use strict';

/**
 * Dependencies
 */
var path = require('path');
var should = require('should');
var EventEmitter = require('events').EventEmitter;
var Zaz = require('../../lib/zaz');
var config = require('../fixtures/zaz.json');
var cwd = process.cwd();
var fixtureFolder = path.join(cwd, 'test', 'fixtures');

describe('Zaz', function() {
  before(function(done) {
    process.chdir(fixtureFolder);

    done();
  });

  after(function(done) {
    process.chdir(cwd);

    done();
  });

  it('is an EventEmitter', function(done) {
    var zaz = new Zaz("valid");
    zaz.should.be.an.instanceOf(EventEmitter);

    done();
  });

  describe('has `deploy` method which', function() {
    describe('verifies the stage config and fails', function() {
      it('if the config file is missing', function(done) {        
        process.chdir(cwd);
        var zaz = new Zaz("whatever");
        zaz.deploy(function(err) {
          err.should.be.an.Error;
          err.message.should.be.eql('Configuration file (`zaz.json`) not found!');
          
          process.chdir(fixtureFolder);        
          done();
        });
      });
      
      it('if the user is missing', function(done) {
        var zaz = new Zaz("missingUser");
        zaz.deploy(function(err) {
          err.should.be.an.Error;
          err.message.should.be.eql('Stage configuration is incomplete: the deployment user is missing!');
          
          done();
        });
      });
      
      it('if the Git repository is missing', function(done) {
        var zaz = new Zaz("missingGit");
        zaz.deploy(function(err) {
          err.should.be.an.Error;
          err.message.should.be.eql('Stage configuration is incomplete: the source repository is missing!');
          
          done();
        });
      });
      
      it('if the deployment path is missing', function(done) {
        var zaz = new Zaz("missingPath");
        zaz.deploy(function(err) {
          err.should.be.an.Error;
          err.message.should.be.eql('Stage configuration is incomplete: the destination path is missing!');
          
          done();
        });
      });
      
      it('if the host list is missing', function(done) {
        var zaz = new Zaz("missingHosts");
        zaz.deploy(function(err) {
          err.should.be.an.Error;
          err.message.should.be.eql('Stage configuration is incomplete: the host list is missing!');
          
          done();
        });
      });
      
      it('if the host list is empty', function(done) {
        var zaz = new Zaz("emptyHosts");
        zaz.deploy(function(err) {
          err.should.be.an.Error;
          err.message.should.be.eql('Stage configuration is incomplete: the host list is empty!');
          
          done();
        });
      });
    });

    it('creates separate deployment processes for every host');
    it('passes errors from deployment streams');
  });
});
