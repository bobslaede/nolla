'use strict';

var mongoose = require('mongoose');
var UserModel = require('../models/user');
var when = require('when');

var controller = module.exports = function () {

};

controller.findById = function (id) {
  var d = when.defer();
  UserModel.findById(id)
    .populate('apps')
    .exec(function (err, user) {
      if (err) {
        return d.reject(err);
      }
      d.resolve(user);
    });
  return d.promise;
};
