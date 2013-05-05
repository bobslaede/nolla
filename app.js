'use strict';

var serverConf = require('./config/server');
var pluginsConf = require('./config/plugins');
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/nolla');

var db = mongoose.connection;
db.on('error', function (err) {
  console.error(err);
});
db.once('open', function () {
  console.log('yyeeehhhaa');
});

var Hapi = require('hapi');

var server = new Hapi.server(serverConf.hostname, serverConf.port, serverConf.options);

server.plugin.allow({
    ext: true
  })
  .require(pluginsConf, function (err) {
    if (err) {
      throw err;
    }
  });

require('./models').initialize(server);
require('./routes').initialize(server);

server.start(function () {
  console.log('server has started on port: %d', serverConf.port);
});