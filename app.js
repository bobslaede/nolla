
/**
 * Module dependencies.
 */

var config = require('./config');
var express = require('express');
var http = require('http');
var path = require('path');
var mongoose = require('mongoose');
var when = require('when');
var passport = require('passport');
var SessionSockets = require('session.socket.io');

mongoose.connect(config.db);

var app = express();

var MongoStore = require('connect-mongo')(express);
var sessionStore = new MongoStore({
  'mongoose_connection' : mongoose.connection
});
var cookieParser = express.cookieParser(config.secret);


app.configure(function(){
  app.set('port', process.env.PORT || config.port);
//  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(cookieParser);
  app.use(express.session({
    secret: config.secret,
    store : sessionStore
  }));
  app.use(express.methodOverride());
  app.use(app.router);
});

app.configure('development', function(){
  app.use(express.static(path.join(__dirname, 'public', 'app')));
  app.use(express.errorHandler());
});

app.configure('production', function(){
  app.use(express.static(path.join(__dirname, 'public', 'dist')));
});

var server = http.createServer(app);
var io = require('socket.io').listen(server);

io.set('log level', 0);

var sessionSockets = new SessionSockets(io, sessionStore, cookieParser);

var auth = require('./src/auth')(app);
require('./src/sockets')(io, sessionSockets);

server.listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});
