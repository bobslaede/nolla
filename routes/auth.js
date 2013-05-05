'use strict';

var User = require('../models').User;
var when = require('when');

var serverConf = require('../config/server');

var createUser = function (profile) {
  var d = when.defer();
  var user = new User({
    email : profile.emails.pop(),
    displayName : profile.displayName,
    providers : [{
      providerName : profile.provider,
      providerId : profile.id
    }]
  });
  user.save(function (err, user) {
    if (err) {
      d.reject(err);
    } else {
      d.resolve(user);
    }
  });
  return d.promise;
};

var findOrCreateUser = function (profile) {
  var d = when.defer();
  User.findOne({
    'providers.providerName' : profile.provider,
    'providers.providerId' : profile.id
  }, function (err, user) {
    if (err) {
      d.reject(err);
    }
    if (user) {
      d.resolve(user);
    } else {
      d.resolve(createUser(profile));
    }
  });
  return d.promise;
};

module.exports = function (server) {
  var passport = server.plugins.travelogue.passport;
  var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;

  passport.use(new GoogleStrategy(serverConf.google,
    function (accessToken, refreshToken, profile, done) {
      findOrCreateUser(profile).then(function (user) {
        done(null, user);
      }, function (err) {
        throw err;
      });
    }
  ));

  passport.serializeUser(function (user, done) {
    done(null, user._id.toString());
  });

  passport.deserializeUser(function (id, done) {
    User.findById(id, done);
  });

  server.addRoute({
    method: 'GET',
    path: serverConf.urls.failureRedirect,
    config: {
      handler: passport.authenticate('google', {
        scope : ['email', 'profile']
      })
    }
  });

  server.addRoute({
    method: 'GET',
    path: '/auth/google/callback',
    config: {
      handler: function (request) {

        passport.authenticate('google', {
          failureRedirect: serverConf.urls.failureRedirect,
          successRedirect: serverConf.urls.successRedirect,
          failureFlash: true
        })(request, function () {
          return request.reply.redirect('/').send();
        });

      }
    }
  });

};