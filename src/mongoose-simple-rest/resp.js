'use strict';

var when = require('when');
var _ = require('underscore');

var Resp = function () {
  this.todos = [];
  this.q = undefined;
  this.last = undefined;
  this.documents = [];
};

Resp.prototype = {
  add : function (Model, collection, query) {
    var todo = {
      Model: Model,
      collection: collection,
      query: query
    };
    this.todos.push(todo);
  },
  exec : function () {
    var d = when.defer();
    this.findThen()
      .then(function (finalResponse) {
        d.resolve(finalResponse);
      }, function (err) {
        d.reject(err);
      });
    return d.promise;
  },
  findThen : function () {
    var self = this;
    var todo = this.todos.shift();
    var d = when.defer();
    if (todo) {
      // if it has an id, then it could be populated, otherwise, it cant
      this.last = todo;
      if (todo.query._id) {
        console.log('finding one', todo.collection);
        todo.Model.findOne(todo.query)
          .exec(function (err, response) {
            todo.response = response;
            self.documents.push(todo);
            if (err) {
              d.reject(err);
            } else {
              if (response) {
                d.resolve(self.populate(response, todo));
              } else {
                d.resolve(response);
              }
            }
          });
      } else {
        console.log('finding list', todo.collection);
        todo.Model.find(todo.query)
          .exec(function (err, response) {
            todo.response = response;
            self.documents.push(todo);
            if (err) {
              d.reject(err);
            } else {
              d.resolve(response);
            }
          });
      }
    } else {
      d.resolve();
    }
    return d.promise;
  },
  getPopulationName : function (Model, fieldName) {
    var test = new RegExp(fieldName, 'i');
    var newName = fieldName;
    Model.schema.eachPath(function (path) {
      console.log('testing', path, test);
      if (test.test(path)) {
        newName = path;
      }
    });
    return newName;
  },
  populate : function (docs, prevTodo) {
    var self = this;
    var d = when.defer();
    if (this.todos.length) {
      console.log('more to do')
      var next = this.todos.shift();
      // the population has an id, maybe this too could be populated
      var pop = {
        path : self.getPopulationName(prevTodo.Model, next.collection),
        query : next.query
      };
      console.log(pop);
      this.last = next;
      if (next.query._id) {
        console.log('finding sub one in ', next.collection);
        docs.populate(pop, function (err, response) {
            next.response = response;
            if (err) {
              d.reject(err);
            } else {
              var docs = response[pop.path];
              var doc = docs.pop();
              d.resolve(self.populate(doc, next));
            }
          });
      } else { // not an id, this is a list, so were done!
        console.log('finding sub list', next.collection);
        docs.populate(pop, function (err, response) {
          next.response = response;
          if (err) {
            d.reject(err);
          } else {
            d.resolve(response[pop.path]);
          }
        });
      }
      self.documents.push(next);
    } else {
      d.resolve(docs);
    }
    return d.promise;
  }
};

module.exports = Resp;