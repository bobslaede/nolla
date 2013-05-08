'use strict';

var config = require('../config');

var AuthController = require('../controllers/auth');
var restMiddleware = require('../src/rest-middleware');
var utils = require('../src/utils');
var _ = require('underscore');

module.exports = {
  initialize : function (app) {

    require('../models/client');
    require('../models/app');
    require('../models/journal-entry');
    require('../models/user');

    app.get('/', function (req, res) {
      if (req.isAuthenticated()) {
        res.redirect('/nolla');
      } else {
        res.render('login');
      }
    });

    app.get('/nolla/:app?',
      AuthController.ensureAuthenticated,
      function (req, res) {
        if (req.params.app !== undefined && req.user.apps[req.params.app] !== undefined) {
          req.session.activeApp = req.params.app;
          res.render('index', { user : req.user });
        } else {
          var activeApp = 0;
          if (req.user.apps.length === 0) {
            res.render('create-app', { user: req.user });
          } else if (req.user.apps.length === 1) {
            res.redirect('/nolla/' + activeApp + '/');
          } else {
            res.render('choose-app', { user: req.user });
          }
        }
      });

    app.get(config.urls.login, function (req, res, next) {
      if (req.isAuthenticated()) {
        res.redirect('/nolla');
      } else {
        next();
      }
    }, AuthController.login);

    app.get(config.urls.callback, AuthController.callback);

    app.get(config.urls.logout, AuthController.logout);

    var rest = restMiddleware();

    rest.on('pre.*.clients', function(req, res, model, search) {
      var meta = utils.createSearchMetaData(req.user, req.session.activeApp);
      _.extend(search, meta);
    });

    rest.on('pre.*.users', function(req, res, model, search) {
      var app = utils.getUserApps(req.user, req.session.activeApp);
      search.apps = app._id;
    });

    rest.on('pre.*.apps', function(req, res, model, search) {
      search.users = req.user._id;
    });

    var createPreFilter = function (req, res, model, search, data) {
      var meta = utils.createSearchMetaData(req.user, req.session.activeApp);
      _.extend(search, meta);
      data.meta = {
        app : req.user.apps[req.session.activeApp]._id,
        owner : req.user._id,
        createdAt : Date.now()
      };
    };

    rest.on('pre.put.*', createPreFilter);

    app.use('/api', AuthController.ensureAuthenticated);
    app.use('/api', rest.getMiddleware());

  }
};