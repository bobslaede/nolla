'use strict';

var _ = require('underscore');
var utils = require('./utils');
var methods = require('methods');
var Resp = require('./resp');
var when = require('when');
var express = require('express');

var Rest = function (options) {
  var self = this;
  this.options = _.extend({}, options);
  this.models = {};
  this.filters = {};

  this.queryRouter = new express.Router();
  this.postRouter = new express.Router();

  this.middleware = function (req, res, next) {
    self._dispatch(req, res, next);
  };

};

Rest.prototype = {
  _dispatch : function (req, res, next) {
    console.log(req.method, req.url);
    var self = this;
    req.rest = {};
    var matches = req.url.match(utils.pathRegex);
    if (matches) {
      var chunks = utils.chunk(matches, 2);
      var resp = new Resp();
      _.each(chunks, function (chunk) {
        var collection = chunk[0];
        var id = chunk[1];
        var Model = self.models[collection.toLowerCase()];
        if (Model) {
          var query = {};
          if (id) {
            query._id = id;
          }
          req.rest.query = query;
          req.rest.Model = Model;
          self.queryRouter.middleware(req, res, function () {
            query = self.buildQuery(collection, query);
            resp.add(Model, collection, query);
          });
        } else {
          res.status(404).send('Model not found');
        }
      });

      resp.exec()
        .then(function (response) {
          console.log(resp, response.length, req.method);
          switch (req.method) {
          case 'DELETE':

            if (resp.last.query._id) {
              resp.last.Model.remove({ _id : response._id }, function (err, response) {
                if (err) {
                  res.status(404).send(err);
                } else {
                  res.send(response);
                }
              });
            } else {
              res.status(404).send();
            }

            break;
          case 'POST':
          case 'CREATE':
          case 'PUT':
          case 'UPDATE':

            var data = _.clone(req.body);
            delete data._id;
            delete data.__v;
            req.rest.data = data;

            console.log('create data', data);

            self.postRouter.middleware(req, res, function () {
              var data = req.rest.data;
              console.log('post route is done', resp.last.query);

              if (resp.last.query._id) { // UPDATE
                response.update(data, function (err, response) {
                  if (err) {
                    res.status(404).send(err);
                  } else {
                    res.send(req.body);
                  }
                });
              } else { // CREATE
                var model = new resp.last.Model(data);
                console.log('parent docs', resp.documents.length);
                model.save(function (err, response) {
                  console.log('saved create', response);
                  if (err) {
                    res.status(404).send(err);
                  } else {
                    // this one has a parent doc, that we need to push it too!
                    if (resp.documents.length > 1) {
                      resp.documents.forEach(function (doc, i) {
                        console.log('prev', i, doc.collection);
                      });
                      var parent = _.last(resp.documents, 2)[0];
                      console.log('last 2 first', parent.collection)
                      var key = resp.getPopulationName(parent.Model, resp.last.collection);
                      console.log('found this parent', parent.collection, parent.response._id, key);
                      if (parent.response[key]) {
                        parent.response[key].push(response);
                        console.log('pushing to', key);
                        parent.response.save(function (err, r) { // no response on purpase, will send original response
                          if (err) {
                            res.status(404).send(err);
                          } else {
                            res.send(response);
                          }
                        });
                      } else {
                        res.status(404).send('Parent not found');
                      }
                    } else {
                      res.send(response);
                    }
                  }
                });
              }

            });
            break;
          default:
            res.send(response);
            break;
          }
        }, function (err) {
          res.status(404).send(err);
        });

    } else {
      next();
    }
  },
  addModel : function (Model) {
    console.log('adding collection', Model.collection.name);
    this.models[Model.collection.name.toLowerCase()] = Model;
    return this;
  },
  buildQuery : function (collection, query) {
    var Model = this.models[collection.toLowerCase()];
    _.each(query, function (val, key) {
      if (Model.schema.pathType(key) !== 'real') {
        delete query[key];
      }
    });
    return query;
  },
  addQueryFilter : function (method, fn) {
    var self = this;
    if (typeof method !== 'string') {
      fn = method;
      method = methods;
    } else {
      method = [method];
    }
    _.each(method, function (m) {
      self.queryRouter.route(m, '*', fn);
    });
  },
  addPostFilter : function (method, fn) {
    var self = this;
    if (typeof method !== 'string') {
      fn = method;
      method = methods;
    } else {
      method = [method];
    }
    _.each(method, function (m) {
      self.postRouter.route(m, '*', fn);
    });
  }
};

module.exports = Rest;
