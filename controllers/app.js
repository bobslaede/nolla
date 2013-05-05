'use strict';

var mongoose = require('mongoose');
var AppModel = require('../models/app');
var when = require('when');

var controller = module.exports = function () {

};

controller.getApp = function (id) {

};

controller.getAppsFromUser = function (user) {
  var id = new mongoose.Schema.ObjectID(user._id.toString());
  var d = when.defer();

  return d.promise;
};