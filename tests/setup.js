global.TextEncoder = require('util').TextEncoder;
global.TextDecoder = require('util').TextDecoder;
global.MediaStream = function () {};
global.AudioContext = function () {};
global.OAuth = function () {
  this.authenticate = jest.fn();
  this.verifyToken = jest.fn();
};
global.Logger = function () {
  this.log = jest.fn();
  this.error = jest.fn();
};
