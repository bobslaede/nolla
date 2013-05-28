'use strict';

var express = require('express');
var _ = require('underscore');
var utils = require('./utils');
var EventEmitter = require('events').EventEmitter;
var mongoose = require('mongoose');

var findModelFromCollection = function (collection) {
  var model = _.filter(mongoose.models, function (m) {
    return m.collection.name === collection;
  });
  if (model.length === 1) {
    return model[0];
  }
  return false;
};

var buildQuery = function (Model, query) {
  query['meta.app'] = '51867014a2d2651ecc692326';
  return query;
};

var validateQuery = function (Model, query) {
  _.each(query, function (val, key) {
    if (Model.schema.pathType(key) !== 'real') {
      delete query[key];
    }
  });
  return query;
};

var findPopulateName = function (Model, fieldName) {
  var test = new RegExp(fieldName, 'i');
  var newName = fieldName;
  Model.schema.eachPath(function (path) {
    if (test.test(path)) {
      newName = path;
    }
  });
  return newName;
};

var Rester = function (options) {

  this.router = new express.Router();

  this.router.route('GET', '/:collection/:id?/:populate?/:populateId?', function (req, res, next) {

    var collection = req.params.collection;
    var Model = findModelFromCollection(collection);

    var method = 'find';
    var query = buildQuery(Model, {});
    var populate;

    if (req.params.id) {
      method = 'findOne';
      query._id = req.params.id;
    }

    query.foobar = 'test';

    query = validateQuery(Model, query);

    if (req.params.populate) {
      populate = {
        path : findPopulateName(Model, req.params.populate)
      };
      var popModel = findModelFromCollection(req.params.populate.toLowerCase());
      populate.query = buildQuery(popModel, {});
      if (req.params.populateId) {
        populate.query._id = req.params.populateId;
      }
      populate.query = validateQuery(popModel, populate.query);
    }

    console.log('method: %s, query: %s, populate: %s', method, JSON.stringify(query), JSON.stringify(populate));
    var find = Model[method](query);
    if (populate) {
      find.populate(populate);
    }
    find.exec(function (err, response) {
      if (err) {
        res.status(404).send(err);
      } else {
        if (populate) {
          var sub = response[populate.path];
          if (req.params.populateId) {
            if (sub.length == 1) {
              res.send(sub.pop());
            } else {
              res.status(404).send('not found');
            }
          } else {
            res.send(sub);
          }
        } else {
          res.send(response);
        }
      }
    });

  });
  /*

  this.router.route('GET',    '/:collection',         this.list.bind(this));

  this.router.route('GET',    '/:collection/:id',     this.one.bind(this));

  this.router.route('GET',    '/:collection/create',  this.put.bind(this));
  this.router.route('POST',   '/:collection',         this.put.bind(this));
  this.router.route('PUT',    '/:collection',         this.put.bind(this));

  this.router.route('GET',    '/:collection/:id/update',  this.update.bind(this));
  this.router.route('UPDATE', '/:collection/:id',         this.update.bind(this));
  this.router.route('POST',   '/:collection/:id',         this.update.bind(this));
  this.router.route('PUT',    '/:collection/:id',         this.update.bind(this));
  this.router.route('PATCH',  '/:collection/:id',         this.update.bind(this));

  this.router.route('DELETE', '/:collection/:id',         this['delete'].bind(this));
  */

};

Rester.prototype = _.extend(Rester.prototype, new EventEmitter(), {
  getMiddleware : function () {
    return this.router.middleware;
  },
  findOne : function (query) {

  },
  find : function (query) {

  },
  populate : function (query) {

  },
  update : function (model, data) {

  },
  create : function (Model, data) {

  },
  findModel : function (collection) {

  },
  execute : function (query) {

  }
});

/*
Rester.prototype = _.extend(Rester.prototype, new EventEmitter2({
  wildcard: true
}), {
  getMiddleware: function () {
    return this.router.middleware;
  },
  list: function (req, res, next) {
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
        .exec(respondFromMongo.call(this, req, res, Model, 'get'));
    }
  },
  one: function (req, res, next) {
    var collection = req.params.collection;
    var Model = utils.findModelFromCollection(collection);
    if (!Model) {
      next();
    } else {
      var search = {
        _id: req.params.id
      };
      this.emit('pre.get.' + collection, req, res, Model, search);

      Model.findOne(search)
        .populate('children')
        .exec(respondFromMongo.call(this, req, res, Model, 'get'));
    }
  },
  put: function (req, res, next) {
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
          Model.findById(model, respondFromMongo.call(this, req, res, Model, 'put'));
        }
      });
    }
  },
  update: function (req, res, next) {
    var collection = req.params.collection;
    var Model = utils.findModelFromCollection(collection);
    if (!Model) {
      next();
    } else {
      var search = {
        _id: req.params.id
      };
      var body = req.body;
      var query = req.query;
      var data = _.extend(query, body);

      this.emit('pre.update.' + collection, req, res, Model, search, data);
      delete data.id;
      delete data._id;
      delete data.__v;

      Model.update(search, { $set : data })
        .exec(respondFromMongo.call(this, req, res, Model, 'update'));
    }
  },
  'delete': function (req, res, next) {
    var collection = req.params.collection;
    var Model = utils.findModelFromCollection(collection);
    if (!Model) {
      next();
    } else {
      var search = {
        _id: req.params.id
      };
      this.emit('pre.delete.' + collection, req, res, Model, search);
      Model.remove(search)
        .exec(respondFromMongo.call(this, req, res, Model, 'delete'));
    }
  }
});
*/

module.exports = Rester;