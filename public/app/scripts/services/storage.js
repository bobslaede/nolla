(function (angular) {
  'use strict';

  angular.module('nolla')
    .factory('storage', function ($window, $q, $log, $serviceScope) {

      var $scope = $serviceScope();

      var setValue = function (key, value) {
        var d = $q.defer();
        if (chrome && chrome.storage && chrome.storage.sync) {
          var data = {};
          data[key] = value;
          chrome.storage.local.set(data, function () {
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
          chrome.storage.local.get(key, function (value) {
            if (value && value[key] !== undefined) {
              $scope.$apply(function () {
                d.resolve(value[key]);
              });
            } else {
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

    });

}(angular));