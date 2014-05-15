#!/usr/bin/env node
'use strict';

/**
 * Dependencies
 */
var commander = require('commander');
var path = require('path');
var config = require(path.join(process.cwd(), 'zaz.json'));
var Zaz = require('../lib/zaz');
var NOOP = function () {};

/**
 * Expose commander
 */
module.exports = commander;

/**
 * Common
 */
commander
  .version(require('../package.json').version, '-v, --version')
  .usage('<stage>')
  .unknownOption = NOOP;

if (process.env.NODE_ENV !== 'test') {
  commander.parse(process.argv);
  var args = commander.args;

  if (args.length == 0)
    commander.help();
  else {
    for (var i = 0; i < args.length; i++) {
      var stageConfig = config.stages[args[i]];
      if (stageConfig) {
        var zaz = new Zaz(stageConfig);
        zaz.deploy();
      }
    }
  }    
}
