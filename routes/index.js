'use strict';

var config = require('../config');
var AuthController = require('../controllers/auth');

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
          switch (req.user.apps.length) {
            case 0:
              res.render('create-app', { user : req.user });
              break;
            case 1:
              res.redirect('/nolla/0/');
              break;
            default:
              res.render('choose-app', { user : req.user });
              break;
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

  }
};