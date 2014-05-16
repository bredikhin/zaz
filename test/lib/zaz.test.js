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

describe('Zaz', function() {
  before(function(done) {
    process.chdir(path.join(cwd, 'test', 'fixtures'));

    done();
  });

  after(function(done) {
    process.chdir(cwd);

    done();
  });

  it('is an EventEmitter', function(done) {
    var zaz = new Zaz(config.stages.valid);
    zaz.should.be.an.instanceOf(EventEmitter);

    done();
  });

  describe('verifies the stage config and', function() {
    it('fails if the user is missing');
    it('fails if the git repository is missing');
    it('fails if the deployment path is missing');
    it('fails if the host list is missing');
    it('fails if the host list is empty');
  });

  describe('has `deploy` method which', function() {
    it('creates separate child processes for every server');
  });
});
