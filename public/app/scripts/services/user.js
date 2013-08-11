(function (angular) {
  'use strict';

  angular.module('nolla')
    .factory('user', function (config, $http, $q, $serviceScope) {

      var $scope = $serviceScope();

      $scope.user = undefined;

      $scope.isAuthenticated = function () {
        var d = $q.defer();
        if ($scope.user !== undefined) {
          d.resolve($scope.user);
        } else {
          $http.get(config.authUrl)
            .then(function (response) {
              $scope.user = response.data;
              d.resolve($scope.user);
            }, function () {
              $scope.user = undefined;
              d.reject(new Error('not authed'));
            });
        }
        return d.promise;
      };

      return $scope;

    });

}(angular));