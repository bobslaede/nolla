'use strict';

var mongoose = require('mongoose');
var _ = require('underscore');

module.exports.findModelFromCollection = function (collection) {
  var model = _.filter(mongoose.models, function (m) {
    return m.collection.name === collection;
  });
  if (model.length === 1) {
    return model[0];
  }
  return false;
};

module.exports.createSearchMetaData = function (user, appIndex) {
  var ret = {};
  var app = user.apps[appIndex];
  ret['meta.app'] = app._id;
  return ret;
};