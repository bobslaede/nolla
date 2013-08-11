'use strict';

var UserModel = require('../models/user');
var request = require('request');
var config = require('../config');
var when = require('when');

module.exports = function (app) {

  var findUser = function (profileId) {
    var d = when.defer();
    console.log('finduser', profileId);
    UserModel.findOne({'providers.providerName' : 'google', 'providers.providerId' : profileId})
      .populate('apps')
      .exec()
      .then(function (user) {
        console.log('found user', user);
        if (user) {
          d.resolve(user);
        } else {
          d.reject('no such user');
        }
      }, function(err) {
        console.log('didnt find user', err);
        d.reject(err);
      })
    return d.promise;
  };

  app.get('/auth', function (req, res, next) {
    console.log('session', req.session);
    var userId = req.session.userId;
   // var appId = req.session.appId;
    var query = {};
    query._id = userId;
   // if (appId) {
      //query['apps._id'] = appId;
   // }
    console.log('usermodel findone', query);
    UserModel.findOne(query)
      .populate('apps')
      .exec()
      .then(function (user) {
        if (user) {
          res.send(user);
        } else {
          res.send({});
        }
      }, function (err) {
        res.status(500).send(err);
      })
  });

  app.post('/auth', function (req, res, next) {
    var accessToken = req.body.access_token;
    var clientId = req.body.client_id;
    request('https://www.googleapis.com/oauth2/v1/tokeninfo?access_token=' + accessToken,
      function (err, response, body) {
        if (err) {
          res.status(500).send(err);
        }
        if (body) {
          try {
            var obj = JSON.parse(body);
            if (config.google.clientIds.indexOf(obj.issued_to) > -1) {
              console.log('token is issued to me!')
              findUser(obj.user_id)
                .then(function (user) {
                  req.session.userId = user._id;
                  req.session.appId = user.apps[0]._id;
                  res.send(user);
                }, function (err) {
                  res.status(500).send(err);
                })
            } else {
              res.status(500).send();
            }
            console.log(obj);
          } catch (e) {
            res.status(500).send(e);
          }
        }
      })
  });

  return {
    middleware : function (req, res, next) {

      next();
    }
  }

};