'use strict';

var mongoose = require('mongoose');
var ClientModel = require('../models/client');
var when = require('when');
var AppsController = require('./apps');

var controller = module.exports = function () {

};

controller.get = function (req, res) {
  var app = AppsController.getAppFromUserIndex(req);
  ClientModel.find({
    'meta.app' : app._id
  })
    .exec(function (err, clients) {
      if (err) {
        return res.status(404).send(err);
      }
      res.send(clients);
    });
};

controller.put = function (req, res) {
  var app = AppsController.getAppFromUserIndex(req);
  var data = {
    meta : [
      {
        app : app._id,
        owner : req.user._id
      }
    ]
  };
  new ClientModel(data)
    .save(function (err, client) {
      if (err) {
        return res.status(404).send(err);
      }
      res.send(client);
    });
};
