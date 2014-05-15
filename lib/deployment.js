'use strict';

/**
 * Dependencies
 */
var util = require('util');
var Transform = require('stream').Transform;
var Connection = require('ssh2');
var path = require('path-extra');
var Folders = require('./folders');
var Clone = require('./clone');
var Install = require('./install');
var Symlink = require('./symlink');
var Restart = require('./restart');
require('colors');

module.exports = Deployment;

function Deployment(config) {
  this._config = config || {};
  this._ssh = null;

  Transform.call(this);
  var self = this;
  
  this.on('ready', function() {        
    var folders = new Folders(self._config.path, self._ssh);
    folders.on('end', function() {
      self.emit('clonable');
    });
    folders.pipe(self, { end: false });
  });
  
  this.on('clonable', function() {        
    var clone = new Clone(self._config.git, self._config.path, self._ssh);
    clone.on('cloned', function(releaseFolder) {
      self.releaseFolder = path.join(self._config.path, 'releases', releaseFolder.toString());
      self.emit('installable');
    });
    clone.pipe(self, { end: false });
  });
  
  this.on('installable', function() {
    var install = new Install(self.releaseFolder, self._ssh);
    install.on('installed', function() {
      self.emit('symlinkable');
    });
    install.pipe(self, { end: false });
  });
  
  this.on('symlinkable', function() {
    var symlink = new Symlink(self.releaseFolder, self._ssh);
    symlink.on('symlinked', function() {
      self.emit('restartable');
    });
    symlink.pipe(self, { end: false });
  });
  
  this.on('restartable', function() {
    var restart = new Restart(self.releaseFolder, self._ssh);
    restart.on('restarted', function() {
      self._ssh.end();
    });
    restart.pipe(self, { end: false });
  });
  
  this.push('Connecting...');
  this._ssh = new Connection();

  this._ssh.on('ready', function() {
    self.push(('Connected!').green);
    self.emit('ready');
  });

  this._ssh.on('error', function(err) {
    self.push(('An error occurred: ' + err).red);
  });

  this._ssh.on('end', function() {
    self.push('Disconnecting...'.green);
  });

  this._ssh.on('close', function(had_error) {
    self.push('Disconnected!\n'.green);
    self.emit('end', had_error);
  });

  var settings = {
    host: this._config.host,
    port: this._config.port || 22,
    username: this._config.user,
    privateKey: require('fs').readFileSync(path.join(path.homedir(), '.ssh', 'id_rsa'))
  };
  
  this._ssh.connect(settings);
}

util.inherits(Deployment, Transform);

Deployment.prototype._transform = function(chunk, enc, cb) {  
  this.push(chunk.toString());
  
  cb();
}