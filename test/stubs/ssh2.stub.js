'use strict';

/**
 * Dependencies
 */
var sinon = require('sinon');
var ssh2 = require('ssh2');
var Readable = require('stream').Readable;

before(function(done){
  sinon.stub(ssh2.prototype, 'connect', function(settings) {
    this.emit('ready');
  });

  sinon.stub(ssh2.prototype, 'exec', function(command, cb) {
    var stream = new Readable();
    stream._read = function() {
      this.push(null);
    };
    
    cb(null, stream);
  });
  
  done();
});

after(function(done){
  ssh2.prototype.connect.restore();

  done();
});