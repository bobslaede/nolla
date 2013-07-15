'use strict';

angular.module('nolla')
  .filter('moment', function () {
    return function (str, expression) {
      if (!str) {
        return '';
      }
      if (str.format) {
        return str.format(expression);
      }
      return moment(str).format(expression);
    }
  });
