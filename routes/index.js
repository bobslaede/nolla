'use strict';

var config = require('../config');

var AuthController = require('../controllers/auth');
var AppsController = require('../controllers/apps');
var ClientsController = require('../controllers/clients');

var mongoose = require('mongoose');
var restMiddleware = require('../src/rest-middleware');

module.exports = {
  initialize : function (app) {

    app.get('/', function (req, res, next) {
      res.render('login');
    });

    app.get('/nolla/:app?',
      AuthController.ensureAuthenticated,
      function (req, res) {
        if (req.params.app) {
          res.render('index', { user : req.user });
        } else {
          if (req.user.apps.length === 0) {
            res.render('create-app', { user: req.user });
          } else if (req.user.apps.length === 1) {
            res.redirect('/nolla/0/');
          } else {
            res.render('choose-app', { user: req.user });
          }
        }
      });

    app.get(config.urls.login, function (req, res, next) {
      if (req.isAuthenticated()) {
        return res.redirect('/nolla');
      }
      next();
    }, AuthController.login);

    app.get(config.urls.callback, AuthController.callback);

    app.get(config.urls.logout, AuthController.logout);

/*
    app.get('/api/apps', AppsController.get);
    app.get('/api/:app/clients', ClientsController.get);
    app.put('/api/:app/clients', ClientsController.put);
    app.get('/api/:app/clients/create', ClientsController.put);
*/
    app.use('/api', restMiddleware(mongoose));

  }
};