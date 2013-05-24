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

/**
 * Get the current users apps, if given index, return only that app
 * @param user
 * @param {Int} index
 * @returns {Mixed} Object/Array
 */
module.exports.getUserApps = function (user, index) {
  var apps = user.apps;
  if (index !== undefined) {
    return apps[index];
  } else {
    return apps;
  }
};

module.exports.createSearchMetaData = function (user, app) {
  var ret = {};
  ret['meta.app'] = app._id;
  return ret;
};

