'use strict';

var auth = require('./auth');
var pub = require('./public');

module.exports = {
  initialize : function (server) {
    auth(server);
    pub(server);
  }
};