'use strict';

/**
 * Dependencies
 */
var util = require('util');
var Transform = require('stream').Transform;
var Connection = require('ssh2');
var path = require('path-extra');
var Sssh = require('sssh').Command;
require('colors');

module.exports = Deployment;

function Deployment(config) {
  this._config = config || {};
  this._ssh = null;

  Transform.call(this);
}

util.inherits(Deployment, Transform);

Deployment.prototype.start = function() {
  var self = this;

  if (!this._config.user) {
    this.emit('error', new Error('Stage configuration is incomplete: the deployment user is missing!'));
    return;
  }

  if (!this._config.git) {
    this.emit('error', new Error('Stage configuration is incomplete: the source repository is missing!'));
    return;
  }
  
  if (!this._config.path) {
    this.emit('error', new Error('Stage configuration is incomplete: the destination path is missing!'));
    return;
  }
  
  if (!this._config.host) {
    this.emit('error', new Error('Stage configuration is incomplete: the destination host is missing!'));
    return;
  }
  
  this.on('ready', function() {
    var folder = this._config.path;
    var command = 'mkdir -p '
      + path.join(folder, 'releases')
      + ' ' + path.join(folder, 'shared', 'log')
      + ' ' + path.join(folder, 'shared', 'tmp');
    var folders = new Sssh(self._ssh, command);
    folders.on('end', function() {
      self.emit('clonable');
    });
    folders.pipe(self, { end: false });
  });
  
  this.on('clonable', function() {
    var release = new Date().getTime().toString();
    this._releaseFolder = path.join(self._config.path, 'releases', release);
    var command = 'cd '
      + path.join(self._config.path, 'releases')
      + ' && git clone ' + self._config.git + ' ' + release;
    var clone = new Sssh(self._ssh, command);
    clone.on('end', function() {
      self.emit('installable');
    });
    clone.pipe(self, { end: false });
  });
  
  this.on('installable', function() {
    var command = 'cd '
      + this._releaseFolder
      + ' && npm install --loglevel error';
    var install = new Sssh(self._ssh, command);
    install.on('end', function() {
      self.emit('symlinkable');
    });
    install.pipe(self, { end: false });
  });
  
  this.on('symlinkable', function() {
    var tmpFolder = path.join(this._releaseFolder, 'tmp');
    var logFolder = path.join(this._releaseFolder, 'log');
    var command = 'cd ' + this._releaseFolder
      + ' && rm -rf ' + tmpFolder + ' ' + logFolder
      + ' && ln -s ../../shared/tmp && ln -s ../../shared/log';
    var symlink = new Sssh(self._ssh, command);
    symlink.on('end', function() {
      self.emit('restartable');
    });
    symlink.pipe(self, { end: false });
  });
  
  this.on('restartable', function() {
    var command = 'cd '
      + this._releaseFolder
      + ' && ((npm --production run status && npm --production run deploy) || npm --production start)';
    var restart = new Sssh(self._ssh, command);
    restart.on('end', function() {
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
    self.emit('error', err);
  });

  this._ssh.on('end', function() {
    self.push('Disconnecting...'.green);
  });

  this._ssh.on('close', function(had_error) {
    self.push('Disconnected!\n'.green);
    if (had_error)
      self.emit('error', new Error('A connection error eccurred!'));
  });
  
  var settings = {
    host: this._config.host,
    port: this._config.port || 22,
    username: this._config.user,
    privateKey: require('fs').readFileSync(path.join(path.homedir(), '.ssh', 'id_rsa'))
  };
  
  this._ssh.connect(settings);
}

Deployment.prototype._transform = function(chunk, enc, cb) {
  this.push(chunk.toString());
  
  cb();
}
