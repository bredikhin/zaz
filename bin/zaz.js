#!/usr/bin/env node
'use strict';

/**
 * Dependencies
 */
var commander = require('commander');
var Zaz = require('../lib/zaz');
var NOOP = function () {};
require('colors');

/**
 * Expose commander
 */
module.exports = commander;

/**
 * Help
 */
commander
  .command('help')
  .description('output usage information')
  .usage('zaz help')
  .action(commander.help)
  .unknownOption = NOOP;

/**
 * Version
 */
commander
  .version(require('../package.json').version, '-v, --version')
  .usage('<stage>');
commander
  .command('version')
  .description('output version number')
  .usage('zaz version')
  .action(commander.versionInformation)
  .unknownOption = NOOP;

commander.unknownOption = NOOP;

if (process.env.NODE_ENV !== 'test') {
  commander.parse(process.argv);
  var args = commander.args;

  if (args.length == 0)
    commander.help();
  else {
    var zaz = new Zaz(args[0]);
    zaz.deploy(function(err) {
      if (err) {
        console.error('\n' + err.toString().red);
        process.exit(1);
      }
      
      console.info('Deployed successfully!'.green);
    });
  }
}
