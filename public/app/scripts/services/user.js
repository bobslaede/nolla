(function (angular) {
  'use strict';

  angular.module('nolla')
    .factory('user', function (config, $http, $q) {

      var user = {};

      return {

        isAuthenticated : function () {
          var d = $q.defer();
          if (user) {
            d.resolve();
          } else {
            $http.get(config.authUrl)
              .then(function (response) {
                user = response;
                d.resolve();
              }, function () {
                user = {};
                d.reject(new Error('not authed'));
              });
          }
          return d.promise;
        },

        user : user
      }

    });

}(angular));