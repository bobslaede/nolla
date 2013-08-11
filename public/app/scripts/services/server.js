(function (angular) {
  'use strict';

  angular.module('nolla')
    .provider('server', function () {
      var self = this;

      this.socket = undefined;
      this.model = {
        apps : [],
        user : {}
      };

      this.$get = ['auth', 'socket', '$q', '$rootScope', '$log', 'HashKeyCopier', function (auth, socket, $q, $rootScope, $log, HashKeyCopier) {
        this.socket = socket;

        socket.on('connect', function () {
          console.log('socket connected');
        });

        socket.on('error', function (err) {
          $log.error(err);
        });

        socket.on('apps:list', function (apps) {
          self.model.apps = HashKeyCopier.copyHashKeys(self.model.apps, apps);
          self.apps = apps;
        });

        this.getModel = function (key, query, options) {
          var query = query;
          var model = {};
          var options = _.extend({
            before: function (arg) { return arg },
            after : function (arg) { return arg }
          }, options);
          model.list = [];

          var _remove = function (response) {
            var newArray = _.reject(model.list, function (item) {
              return (response._id && item._id) && item._id === response._id;
            });
            model.list = HashKeyCopier.copyHashKeys(model.list, newArray, ['_id']);
          };

          var fixBeforeSendingToServer = function (obj) {
            var newObj = _.clone(obj);
            delete newObj.$$hashKey;
            options.after(newObj);
            return newObj;
          };

          /**
           * this function wraps a model obj with certain
           * @param obj
           * @returns {*}
           */
          var wrap = function (obj) {
            if (_.isArray(obj)) {
              _.map(obj, wrap);
            } else {
              if (obj) {
                var save = function () {
                  socket.emit(key + ':save', fixBeforeSendingToServer(obj), function (response) {
                    _.extend(obj, HashKeyCopier.copyHashKeys(obj, response, ['_id']));
                    obj.$rewrap();
                  });
                };
                options.before(obj);
                watch(obj, save);
                obj.$unwrap = function () {
                  unwatch(obj, save);
                };
                obj.$rewrap = function () {
                  obj.$unwrap();
                  watch(obj, save);
                };
                obj.$remove = function () {
                  var index = model.list.indexOf(this);
                  model.list.splice(index, 1);
                  socket.emit(key + ':remove', fixBeforeSendingToServer(this));
                };
                obj.$save = function () {
                  save();
                };
              }
            }
            return obj;
          };

          model.findById = function (id) {
            var searched = _.filter(model.list, function (item) {
              return item._id === id;
            });
            if (searched.length === 1) {
              return searched[0];
            }
            return false;
          };

          model.setQuery = function (value) {
            query = value;
          };

          model.populate = function (cb) {
            socket.socketPromise
              .then(function () {
                socket.emit(key + ':list', query, function (response) {
                  model.list = HashKeyCopier.copyHashKeys(model.list, wrap(response), ['_id']);
                  (cb || function(){})();
                });
              })
            return model;
          };

          model.add = function (obj) {
            var d = $q.defer();
            socket.emit(key + ':add', obj, function (response) {

              var n = wrap(response);
              model.list.push(n);

              d.resolve(response);
            });
            return d.promise;
          };

          model.remove = function (inst) {
            var index = model.list.indexOf(inst);
            model.list.splice(index, 1);
            socket.emit(key + ':remove', fixBeforeSendingToServer(inst));
          };

          socket.on(key + ':list', function (data) {
            model.populate();
          });

          socket.on(key + ':add', function (data) {
            var me = socket.socket.socket.sessionid;
            if (me !== data.origin) {
              if (data.data && data.data._id && false) { // always populate
                var old = model.findById(data.data._id);
                if (old) {
                  // unwrap it, so that change events wont fire will we update it
                  // then wrap it again when its updated;
                  old.$unwrap();
                  old = _.extend(old, data.data);
                  wrap(old);
                } else {
                  var n = wrap(data.data);
                  model.list.push(n);
                }
              } else {
                model.populate();
              }
            }
          });

          socket.on(key + ':update', function (data) {
            var me = socket.socket.socket.sessionid;
            // if i'm not the origin, then update
            if (me !== data.origin) {
              if (data.data && data.data._id) {
                var old = model.findById(data.data._id);
                if (old) {
                  // unwrap it, so that change events wont fire will we update it
                  // then wrap it again when its updated;
                  old.$unwrap();
                  old = _.extend(old, data.data);
                  wrap(old);
                } else {
                  model.populate();
                }
              } else {
                model.populate();
              }
            }
          });

          socket.on(key + ':remove', function (data) {
            var me = socket.socket.socket.sessionid;
            if (me !== data.origin) {
              model.populate();
            }
          });

          return model;
        };

        this.selectApp = function (app) {
          this.socket.emit('apps:select', app, function () {
            self.app = app;
          });
        };

        return this;
      }];

    });

}(angular));
