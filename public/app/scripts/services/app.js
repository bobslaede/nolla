(function (angular) {
  'use strict';

  angular.module('nolla')
    .provider('app', function () {

      this.$get = function () {
        return this;
      };

    });

}(angular));
