(function (angular) {
  'use strict';

  angular.module('nolla.config', [])
    .provider('config', function () {

      var self = this;

      self.host = 'http://localhost:3003';

      Object.defineProperty(self, 'authUrl', {
        get : function () {
          return self.host + '/auth'
        }
      });

      this.$get = function () {
        return self;
      }

    });

}(angular));