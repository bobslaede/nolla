'use strict';

var mongoose = require('mongoose');
var AppModel = require('../models/app');
var when = require('when');

var controller = module.exports = function () {

};

controller.get = function (req, res) {
  var user = req.user;
  res.send(user.apps);
};

controller.getAppFromUserIndex = function (req) {
  var index = req.param.app || 0;
  var user = req.user;
  var apps = user.apps;
  return apps[index];
};