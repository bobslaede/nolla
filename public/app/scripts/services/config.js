(function (angular) {
  'use strict';

  angular.module('nolla')
    .factory('config', function () {

      var config = {
        host : 'http://localhost:3003',
        get authUrl () {
          console.log('get authUrl')
          return config.host + '/auth'
        }
      };

      return config;

    });

}(angular));