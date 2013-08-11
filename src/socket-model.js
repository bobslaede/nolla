'use strict';

var EventEmitter = require('events').EventEmitter;
var _ = require('underscore');

var SocketModel = function (socket, Model, options) {

  console.log('new socket model');

  var self = this;
  var key = this.key = Model.collection.name; // eg. clients for ClientModel

  var buildGetQuery = function () {
    var q = {};
    var query = options.getQuery || {};
    _.each(query, function (val, key) {
      if (Model.schema.pathType(key) === 'real') {
        if (_.isFunction(val)) {
          q[key] = val();
        } else {
          q[key] = val;
        }
      }
    });
    console.log(q);
    return q;
  };

  var buildSaveQuery = function () {
    var q = {};
    var query = options.saveQuery || {};
    (function fixQuery(obj, prev) {
      _.each(obj, function (val, key) {
        var testKey = (prev ? prev + '.': '')  + key;
        if (['real', 'nested'].indexOf(Model.schema.pathType(testKey)) > -1) {
          if (_.isFunction(val)) {
            obj[key] = val();
          } else if (_.isObject(val)) {
            fixQuery(val, key);
          } else {
          obj[key] = val;
          }
        }
      });
    })(query);
    console.log('save query', query);
    return query;
  }


  socket.on(key + ':list', function (query, cb) {
    console.log(key + ':list');
    query = _.extend(query || {}, buildGetQuery());
    console.log('list', query);
    Model.find(query)
      .exec()
      .then(function (response) {
        cb(response);
      })
  });

  socket.on(key + ':add', function (data, cb) {
    console.log(key + ':add');
    data = _.extend(data, buildSaveQuery());
    console.log('adding new', data);
    var model = new Model(data);
    model
      .save(function (err, response) {
        cb(model);
        self.emit('broadcast', key + ':add', model);
      })
  });

  socket.on(key + ':remove', function (data, cb) {
    console.log(key + ':remove');
    var query = {
      _id : data._id
    };
    _.extend(query, buildGetQuery());
    Model.remove(query, function (err) {
      self.emit('broadcast', key + ':remove', query);
      console.log('deleted', err, query);
    });
  });

  socket.on(key + ':save', function (data, cb) {
    console.log(key + ':save', data);
    var query = {
      _id : data._id
    };
    var cln = _.clone(data);
    delete cln._id;
    delete cln.__v;
    var update = {
      $set : cln
    };

    _.extend(query, buildGetQuery());
    _.extend(update, buildSaveQuery());

    Model.update(query, update)
      .exec()
      .then(function (response) {
        self.emit('broadcast', key + ':update', data);
      }, function (err) {
        socket.emit('error', err);
      });
  });

};

SocketModel.protype = _.extend(SocketModel.prototype, EventEmitter.prototype, {
});

module.exports = SocketModel;