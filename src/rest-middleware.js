'use strict';

var express = require('express');
var _ = require('underscore');
var utils = require('./utils');

var preFilters = {
  '*' : {},
  'GET' : {},
  'PUT' : {},
  'DELETE' : {},
  'CREATE' : {},
  'UPDATE' : {}
};
var postFilters = _.clone(preFilters);

var sfunc = function (arg1) {
  return arg1;
};

var addPreFilter = function (type, collection, handle) {
  if (preFilters[type] === undefined) {
    throw 'No such type for filtering';
  }
  if (collection === undefined) {
    throw 'Must specify collection to filter on or * for all';
  }
  if (handle === undefined) {
    handle = sfunc;
  }
  if (preFilters[type][collection] === undefined) {
    preFilters[type][collection] = [];
  }
  preFilters[type][collection].push(handle);
};

/**
 * Will get either 'pre', or 'post' filters for rest services and return a function that will run on each method from the filters, in order
 * @param pos
 * @param collection
 * @param type
 * @returns {Function}
 */
var getFilters = function (pos, collection, type) {
  var filter = pos === 'pre' ? preFilters : postFilters;
  var types = Array.prototype.concat.call(['*'], type);
  var methods = [];
  _.each(types, function (t) {
    if (filter[t] !== undefined) {
      methods = methods.concat(methods, filter[t][collection] || []);
    }
  });
  methods = _.uniq(methods);
  return function (req, res, search, data) {
    _.each(methods, function (method) {
      method(req, res, search, data);
    });
  };
};

/**
 * Curry a response function that will run the result through any postFilter there is
 * @param {Object} req
 * @param {Object} res
 * @param {String} collection
 * @returns {Function} function (err, result)
 */
var respondFromMongo = function (req, res, collection) {
  return function (err, result) {
    if (err !== null) {
      res.status(404).send(err);
    } else {
      if (postFilters[collection] !== undefined) {
        getFilters('post', collection, req.method)(req, res, result);
      }
      res.send(result);
    }
  };
};

var getRoute = function (req, res, next) {
  var collection = req.params.collection;
  var Model = utils.findModelFromCollection(collection);
  if (!Model) {
    next();
  } else {
    var search = {};
    getFilters('pre', collection, req.method)(req, res, search);
    Model.find(search)
      .exec(respondFromMongo(req, res, collection));
  }
};

var findRoute = function (req, res, next) {
  var collection = req.params.collection;
  var Model = utils.findModelFromCollection(collection);
  if (!Model) {
    next();
  } else {
    var search = {
      _id : req.params.id
    };
    if (preFilters[collection] !== undefined) {
      getFilters('pre', collection, req.method)(req, res, search);
    }
    Model.findOne(search)
      .exec(respondFromMongo(req, res, collection));
  }
};

var createRoute = function (req, res, next) {
  var collection = req.params.collection;
  var Model = utils.findModelFromCollection(collection);
  if (!Model) {
    next();
  } else {
    var search = {};
    var body = req.body;
    var query = req.query;
    var data = _.extend(query, body);
    console.log('before', data);
    getFilters('pre', collection, 'CREATE')(req, res, search, data);
    console.log('after', data);

    var model = new Model(data);
    model.save(function (err) {
      if (err !== null) {
        res.status(500).send(err);
      } else {
        Model.findById(model, respondFromMongo(req, res, collection));
      }
    });
  }
};

module.exports = function () {


  var router = new express.Router();

  router.route('GET', '/:collection', getRoute);
  router.route('GET', '/:collection/create', createRoute);
  router.route('POST', '/:collection/', createRoute);
  router.route('GET', '/:collection/:id', findRoute);

  return {
    addPreFilter : addPreFilter,
    middleware : router.middleware
  };

};