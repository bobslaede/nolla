'use strict';

var express = require('express');
var _ = require('underscore');
var utils = require('./utils');

module.exports = function (mongoose) {

  var router = new express.Router();

  router.route('GET', '/:app/:collection', function (req, res, next) {
    var model = utils.findModelFromCollection(req.params.collection);
    var find = utils.createSearchMetaData(req.user, req.params.app);
    if (!model) {
      return next();
    }
    model.find(find)
      .exec(function (err, data) {
        if (err) {
          return res.status(404).send(err);
        }
        res.send(data);
      });
  });

  router.route('GET', '/:app/:collection/:id', function (req, res, next) {
    var model = utils.findModelFromCollection(req.params.collection);
    var find = utils.createSearchMetaData(req.user, req.params.app);

    find._id = req.params.id;

    if (!model) {
      return next();
    }
    model.findOne(find)
      .exec(function (err, data) {
        if (err) {
          return res.status(404).send(err);
        }
        res.send(data);
      });
  });

  var middleware = router.middleware;

  return function (req, res, next) {
    router.middleware(req, res, next);
  };

};