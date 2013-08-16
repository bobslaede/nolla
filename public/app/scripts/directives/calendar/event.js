'use strict';

angular.module('nolla.calendar')
  .directive('nlEvent', function ($compile, $rootScope) {

    return {
      restrict: 'A',
      require: ['^nlCalendar'],
      controller : function ($scope) {
      },
      compile: function (element, attrs) {
        return function ($scope, element, attrs, controllers) {
        }
      }
    };

  });