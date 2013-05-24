'use strict';

var config = require('../config');
var express = require('express');
var _ = require('underscore');
var utils = require('./utils');
var client = new (require('node-rest-client').Client);
var UserModel = require('../models/user');
var when = require('when');


var updateUser = function (user, profile) {
  user.email = profile.email;
  user.displayName = profile.name;
  user.avatar = profile.picture;
  user.save();
};

var createUser = function (profile) {
  var d = when.defer();
  console.log('create')
  var user = new UserModel({
    providers : [{
      providerName : 'google',
      providerId : profile.id
    }]
  });
  user.save(function (err, user) {
    if (err) {
      d.reject(err);
    } else {
      updateUser(user, profile);
      d.resolve(user);
    }
  });
  return d.promise;
};

var findOrCreateUser = function (profile) {
  var d = when.defer();
  console.log('find or create', profile);
  UserModel.findOne({
      'providers.providerName' : 'google',
      'providers.providerId' : profile.id
    })
    .populate('apps')
    .exec(function (err, user) {
      if (err) {
        d.reject(err);
      } else {
        if (user) {
          updateUser(user, profile);
          d.resolve(user);
        } else {
          d.resolve(createUser(profile));
        }
      }
    });
  return d.promise;
};

var Auth = function () {

  this.router = new express.Router();

  this.router.route('POST',   '/auth',   this.auth.bind(this));
  this.router.route('GET',    '/logout', this.logout.bind(this));
  this.router.route('GET',    '/auth',   this.ensureAuthenticated.bind(this));
  this.router.route('GET',    '/auth',   this.getAuthenticatedUser.bind(this));

  this.router.route('GET',    '/*', this.ensureAuthenticated.bind(this));
  this.router.route('POST',   '/*', this.ensureAuthenticated.bind(this));
  this.router.route('PUT',    '/*', this.ensureAuthenticated.bind(this));
  this.router.route('DELETE', '/*', this.ensureAuthenticated.bind(this));
  this.router.route('HEAD',   '/*', this.ensureAuthenticated.bind(this));
  this.router.route('UPDATE', '/*', this.ensureAuthenticated.bind(this));
  this.router.route('PATCH',  '/*', this.ensureAuthenticated.bind(this));

};

Auth.prototype = {
  getMiddleware : function () {
    return this.router.middleware;
  },
  auth : function (req, res, next) {
    console.log('do auth');
    if (req.body['client_id'] === config.google.clientID) {
      client.get('https://www.googleapis.com/oauth2/v1/userinfo?alt=json', {
        headers : {
          'Authorization': (req.body['token_type'] || 'Bearer') + ' ' + req.body['access_token']
        }
      }, function (response) {
        var profile = JSON.parse(response);
        if (profile && profile.id) {
          findOrCreateUser(profile)
            .then(function (user) {
              req.session.userId = user._id;
              res.send(user);
            }, function (err) {
              res.status(401).send('Not authorized');
            });
        } else {
          res.status(401).send('Not authorized');
        }
      });
    } else {
      res.status(401).send('Not authorized');
    }
  },
  ensureAuthenticated : function (req, res, next) {
    if (req.session.userId) {
      UserModel.findOne(req.session.userId)
        .populate('apps')
        .exec(function (err, user) {
          if (err) {
            res.status(500).send(err);
          } else {
            req.user = user;
            if (req.session.activeAppId) {
              req.app = _.filter(req.user.apps, function (app) {
                return app._id == req.session.activeAppId;
              }).pop();
            } else {
              req.app = user.apps[0];
              req.session.activeAppId = req.app._id;
            }
            next();
          }
        });
    } else {
      res.status(401).send('Not authorized');
    }
  },
  logout : function (req, res, next) {
    req.session.userId = null;
    next();
  },
  getAuthenticatedUser : function (req, res, next) {
    console.log('get authenticated user');
    res.send(req.user);
    //next();
  }
};

module.exports = new Auth();