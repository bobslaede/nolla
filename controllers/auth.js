'use strict';

var when = require('when');
var passport = require('passport');
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
var config = require('../config');
var UserModel = require('../models/user');
var UserController = require('./user');

var createUser = function (profile) {
  var d = when.defer();
  var user = new UserModel({
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
  UserModel.findOne({
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

passport.use(new GoogleStrategy(config.google,
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
  UserController.findById(id)
    .then(function (user) {
      done(null, user);
    }, function (err) {
      done(err);
    });
});

var controller = module.exports = function () {
};

controller.callback = passport.authenticate('google', {
  failureRedirect: config.urls.failureRedirect,
  successRedirect: config.urls.successRedirect,
  failureFlash: true
});

controller.login = passport.authenticate('google', {
  scope : [
    'https://www.googleapis.com/auth/userinfo.profile',
    'https://www.googleapis.com/auth/userinfo.email'
  ]
});

controller.ensureAuthenticated = function (req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect(config.urls.login);
};

controller.logout = function (req, res) {
  req.logout();
  res.redirect('/');
};
