'use strict';

angular.module('nolla')
  .filter('moment', function () {
    return function (str, expression) {
      if (!str) {
        return '';
      }
      return moment(str).format(expression);
    }
  });
