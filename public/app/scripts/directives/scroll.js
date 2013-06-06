'use strict';

angular.module('nolla')
  .directive('nlScroll', function () {
    return {
      restrict: 'A',
      compile : function () {
        return {
          post : function (scope, element, attrs, controller) {
            console.log(element.height());
          }
        }
      },
      link: function postLink(scope, element, attrs) {
        scope.$watch(function () {
          console.log('scroll changed')
        })
        element[0].scrollTop = 1000000;

      }
    };
  });