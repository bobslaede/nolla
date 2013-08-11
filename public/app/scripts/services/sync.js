(function (angular) {
  'use strict';

  angular.module('nolla')
    .provider('sync', function () {

      this.$get = function (socket, $serviceScope, $q, $log) {

        var scopes = [];

        var getAll = function ($scope, query) {
          var d = $q.defer();

          var model = $scope.model;
          $scope.readyDeferred.promise.then(function () {
            socket.emit('msg', {
              type: 'get',
              model : model,
              data : (query || {})
            }, function (response) {
              $scope.$update('list', response);
              $scope.$wrap($scope.list);

              d.resolve();
            });
          });

          return d.promise;

        };

        var addObjToScopeList = function ($scope, obj) {
          $scope.list.push(obj);
          $scope.$wrap($scope.list);
        };

        var removeObjFromScopeList = function ($scope, obj) {
            var index = $scope.list.indexOf(obj);
            if (index > -1) {
              $scope.list.splice(index, 1);
            }
        };

        var updateObjInScope = function ($scope, obj) {
          findById($scope, obj._id)
            .then(function (orig) {
              orig.$unwrap();
              _.extend(orig, obj);
              orig.$wrap();
            });
        };


        var fixBeforeSendingToServer = function (obj) {
          var newObj = _.clone(obj);
          delete newObj.$$hashKey;
          return newObj;
        };

        var add = function ($scope, obj) {
          var d = $q.defer();

          socket.emit('msg', {
            type : 'add',
            model : $scope.model,
            data : obj
          }, function (response) {
            addObjToScopeList($scope, response);
            d.resolve(response);
          });

          return d.promise;
        };

        var save = function ($scope, obj) {
          var d = $q.defer();
          var data = fixBeforeSendingToServer(obj);
          socket.emit('msg', {
            model : $scope.model,
            type: 'update',
            data : data
          }, function (response) {
            d.resolve(response);
          });
          return d.promise;
        };

        var remove = function ($scope, obj) {
          var d = $q.defer();
          var data = fixBeforeSendingToServer(obj);
          socket.emit('msg', {
            model : $scope.model,
            type: 'delete',
            data : data
          }, function (response) {
            if (response === true) {
              removeObjFromScopeList($scope, obj);
              d.resolve(response);
            } else {
              d.reject();
            }
          });
          return d.promise;
        };

        var findById = function ($scope, id) {
          var d = $q.defer();
          var find = function () {
            var searched = _.filter($scope.list, function (item) {
              return item._id === id;
            });
            if (searched.length === 1) {
              d.resolve(searched[0]);
            } else {
              d.reject();
            }
          }
          if ($scope.list.length === 0) { // nothing in the list, will try to get all before finding by id
            $scope.getAll()
              .then(find);
          } else {
            $scope.readyDeferred.promise.then(find);
          }
          return d.promise;
        };

        var wrapper = function ($scope) {
          return function wrap(obj) {
            if (_.isArray(obj)) {
              _.map(obj, wrap);
            } else {
              if (obj) {
                var _save = function () {
                  save($scope, obj);
                };
                obj.$wrap = function () {
                  try {
                    unwatch(obj, _save);
                  } catch(e) {

                  }
                  watch(obj, _save);
                };
                obj.$unwrap = function () {
                  try {
                    unwatch(obj, _save);
                  } catch (e) {

                  }
                };
                obj.$wrap();
                obj.$save = _save;
              }
            }
          };
        }

        socket.on('msg', function (msg) {
          var model = msg.model;
          var $scope = scopes[model];
          var type = msg.type;
          var data = msg.data;
          var origin = msg.origin;
          var me = socket.socket.socket.sessionid;
          if (me !== origin) {
            switch (type) {
              case 'update':
                updateObjInScope($scope, data);
                break;
              case 'delete':
                findById($scope, data._id)
                  .then(function (obj) {
                    removeObjFromScopeList($scope, obj);
                  });
                break;
              case 'add':
                addObjToScopeList($scope, data);
                break;
            }
          } else {
            //$log.log('origin of event was this session, ignoring');
          }
        });

        var modify = function ($scope) {
          var api = {
            findById : function (id) {
              return findById($scope, id);
            },
            add : function (obj) {
              return add($scope, obj);
            },
            remove : function (obj) {
              return remove($scope, obj);
            },
            getAll : function () {
              return getAll($scope);
            },
            query : function (query) {
              return getAll($scope, query);
            },
            readyDeferred : $q.defer()
          };
          return _.extend($scope, api);
        }

        return function (model, query) {

          $log.log('New sync model: %s', model);
          var $scope = $serviceScope();
          scopes[model] = $scope;

          $scope.list = [];
          $scope.model = model;
          $scope.$wrap = wrapper($scope);

          modify($scope);

          socket.socketPromise.then(function () {
            $scope.readyDeferred.resolve();
          });

          return $scope;
        };

      };

    })
}(angular));