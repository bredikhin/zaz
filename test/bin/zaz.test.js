'use strict';

/**
 * Dependencies
 */
var should = require('should');
var _ = require('lodash');
var path = require('path');
var commander;
var cwd = process.cwd();

describe('Program', function() {
  before(function(done) {
    process.chdir(path.join(cwd, 'test', 'fixtures'));
    commander = require('../../bin/zaz');

    done();
  });

  after(function(done) {
    process.chdir(cwd);

    done();
  });

  it('has a command to display the version number', function(done) {
    _.map(commander.commands, function(command) {
      return command._name;
    }).should.containEql('version');

    _.map(commander.options, function(option) {
      return option.short;
    }).should.containEql('-v');

    _.map(commander.options, function(option) {
      return option.long;
    }).should.containEql('--version');
    done();
  });

  it('has a command to display the usage', function(done) {
    _.map(commander.commands, function(command) {
      return command._name;
    }).should.containEql('help');
    done();
  });
});
