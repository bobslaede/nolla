'use strict';

var config = require('../config');
//var Rester = require('../src/rest-middleware');
var utils = require('../src/utils');
var _ = require('underscore');
var auth = require('../src/auth');

var SimpleRest = require('../src/mongoose-simple-rest');

var rest = new SimpleRest();

module.exports = {
  initialize: function (app) {

    var ClientModel = require('../models/client');
    var AppModel = require('../models/app');
    var JournalEntryModel = require('../models/journal-entry');
    var JournalHelperModel = require('../models/journal-helper');
    var UserModel = require('../models/user');

    app.get('/', function (req, res) {
      res.redirect('/index.html');
    });

    app.use('/api', auth.getMiddleware());

    app.get('/api/activeApp', auth.ensureAuthenticated, function (req, res, next) {
      res.send(req.app);
    });

    app.get('/api/activeApp/:id', auth.ensureAuthenticated, function (req, res, next) {
      var app = _.filter(req.user.apps, function (app) {
        return app._id == req.params.id;
      }).pop();
      if (app) {
        req.session.activeAppId = app._id;
        res.send(app);
      } else {
        res.status(404).send('No such app');
      }
    });

    rest.addModel(AppModel);
    rest.addModel(UserModel);
    rest.addModel(ClientModel);
    rest.addModel(JournalEntryModel);
    rest.addModel(JournalHelperModel);

    rest.addQueryFilter(function (req, res, next) {
      var Model = req.rest.Model;
      var query = req.rest.query;
      query['meta.app'] = req.app._id;
      next();
    });

    rest.addPostFilter(function (req, res, next) {
      var data = req.rest.data;
      var app = req.app;
      if (data.meta) {
        data.meta.app = app._id;
      } else {
        data.meta = {
          app: app._id,
          owner: req.user._id,
          createdAt: Date.now()
        };
      }
      next();
    });

    app.use('/api', rest.middleware);

    /*

    rest.on('pre.*.clients', function (req, res, model, search) {
      var meta = utils.createSearchMetaData(req.user, req.app);
      _.extend(search, meta);
    });

    rest.on('pre.*.users', function (req, res, model, search) {
      var app = utils.getUserApps(req.user, req.app);
      search.apps = app._id;
    });

    rest.on('pre.get.journalhelpers', function (req, res, model, search) {

    });

    rest.on('post.get.journalhelpers', function (req, res, Model, result) {
      console.log(result);
    });

    rest.on('pre.*.apps', function (req, res, model, search) {
      search.users = req.user._id;
    });

    var createPreFilter = function (req, res, model, search, data) {
      var meta = utils.createSearchMetaData(req.user, req.app);
      _.extend(search, meta);
      var app = req.app;
      data.meta = {
        app: app._id,
        owner: req.user._id,
        createdAt: Date.now()
      };
    };

    rest.on('pre.put.*', createPreFilter);

    rest.on('pre.update.*', function (req, res, model, search, data) {
      delete data.meta;
    });

    app.get('/api/me', function (req, res, next) {
      res.send(req.user);
    });
    */
    //app.use('/api', rest.getMiddleware());


  }
};