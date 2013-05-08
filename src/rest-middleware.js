'use strict';

var express = require('express');
var _ = require('underscore');
var utils = require('./utils');
var EventEmitter2 = require('eventemitter2').EventEmitter2;


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
      res.send(result);
    }
  };
};

/*
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
*/

var Rester = function () {


  this.router = new express.Router();

  this.router.route('GET', '/:collection', this.list.bind(this));
  this.router.route('GET', '/:collection/:id', this.one.bind(this));

  this.router.route('GET', '/:collection/create', this.put.bind(this));
  this.router.route('POST', '/:collection', this.put.bind(this));
  this.router.route('PUT', '/:collection', this.put.bind(this));

  this.router.route('GET', '/:collection/:id/update', this.update.bind(this));
  this.router.route('UPDATE', '/:collection/:id', this.update.bind(this));
  this.router.route('POST', '/:collection/:id', this.update.bind(this));
  this.router.route('PATCH', '/:collection/:id', this.update.bind(this));

  this.router.route('DELETE', '/:collection/:id', this['delete'].bind(this));


}

Rester.prototype = _.extend(Rester.prototype, new EventEmitter2({
    wildcard : true
  }), {
  getMiddleware : function() {
    return this.router.middleware;
  },
  list : function (req, res, next) {
    console.log('get route', req.url);
    var collection = req.params.collection;
    var Model = utils.findModelFromCollection(collection);
    if (!Model) {
      next();
    } else {
      var search = {};
      this.emit('pre.get.' + collection, req, res, Model, search);
      console.log('search for', search);
      Model.find(search)
        .exec(respondFromMongo.call(this, req, res, collection));
    }
  },
  one : function (req, res, next) {
    var collection = req.params.collection;
    var Model = utils.findModelFromCollection(collection);
    if (!Model) {
      next();
    } else {
      var search = {
        _id : req.params.id
      };
      this.emit('pre.get.' + collection, req, res, Model, search);
      Model.findOne(search)
        .exec(respondFromMongo.call(this, req, res, collection));
    }
  },
  put : function (req, res, next) {
    var collection = req.params.collection;
    var Model = utils.findModelFromCollection(collection);
    if (!Model) {
      next();
    } else {
      var search = {};
      var body = req.body;
      var query = req.query;
      var data = _.extend(query, body);

      this.emit('pre.put.' + collection, req, res, Model, search, data);

      var model = new Model(data);
      model.save(function (err) {
        if (err !== null) {
          res.status(500).send(err);
        } else {
          Model.findById(model, respondFromMongo.call(this, req, res, collection));
        }
      });
    }
  },
  update : function (req, res, next) {

  },
  'delete' : function (req, res, next) {

  }
})

module.exports = function() {
  return new Rester();
}





