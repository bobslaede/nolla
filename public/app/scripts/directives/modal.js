'use strict';

angular.module('nolla')
  .directive('nlModal', function () {
    return {
      restrict: 'A',
      link: function postLink(scope, element, attrs) {

        element.appendTo('body');

        scope.$on('$destroy', function () {
          _.defer(function () {
            element.remove();
          });
        });

      }
    };
  });