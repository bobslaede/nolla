(function (angular) {
  'use strict';

  angular.module('nolla')
    .provider('storage', function () {
      console.log('storageprovider')

      this.$get = ['$window', '$q', '$log', '$serviceScope', function ($window, $q, $log, $serviceScope) {

        var $scope = $serviceScope();

        var setValue = function (key, value) {
          var d = $q.defer();
          if (chrome && chrome.storage && chrome.storage.sync) {
            var data = {};
            data[key] = value;
            chrome.storage.sync.set(data, function () {
              $scope.$apply(function () {
                d.resolve(value);
              });
            })
          } else if ($window.localStorage && $window.localStorage.setItem) {
            var data = JSON.stringify(value);
            $window.localStorage.setItem(key, value);
            _.defer(function () {
              d.resolve(value);
            });
          }
          return d.promise;
        };

        var getValue = function (key, defaultValue) {
          var d = $q.defer();
          if (chrome && chrome.storage && chrome.storage.sync) {
            chrome.storage.sync.get(key, function (value) {
              if (value && value[key] !== undefined) {
                $scope.$apply(function () {
                  d.resolve(value[key]);
                });
              } else {
                console.log('storage using default value')
                $scope.$apply(function () {
                  d.resolve(defaultValue);
                });
              }
            });
          } else if ($window.localStorage && $window.localStorage.getItem) {
            var value = $window.localStorage.getItem(key);
            if (value) {
              try {
                value = JSON.parse(value);
              } catch(e) {}
              _.defer(function () {
                $scope.$apply(function () {
                  d.resolve(value);
                });
              });
            } else {
              _.defer(function () {
                $scope.$apply(function () {
                  d.resolve(defaultValue);
                });
              });
            }
          }

          return d.promise;
        };

        $scope.get = getValue;
        $scope.set = setValue;

        return $scope;

      }];

    });

}(angular));