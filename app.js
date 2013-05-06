'use strict';

var config = require('./config');
var express = require('express');
var http = require('http');
var path = require('path');
var routes = require('./routes');
var mongoose = require('mongoose');
var passport = require('passport');

mongoose.connect(config.db);
var db = mongoose.connection;
db.on('error', function(err) {
  console.warn('database error: %s', err);
})
db.once('open', function() {
  console.info('database is connected');
})

var MongoStore = require('connect-mongo')(express);

var app = express();

app.configure(function () {
  app.set('port', process.env.PORT || config.port);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'hbs');
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.cookieParser());
  app.use(express.session({
    secret: config.secret,
    store : new MongoStore({
      'mongoose_connection' : mongoose.connection
    })
  }));
  app.use(express.methodOverride());

  app.use(passport.initialize());
  app.use(passport.session());

  app.use(app.router);
  app.use(express.static(path.join(__dirname, 'public')));

});

app.configure('development', function () {
  app.use(express.errorHandler());
});

routes.initialize(app);

http.createServer(app).listen(app.get('port'), function () {
  console.log('Express server listening on port ' + app.get('port'));
});