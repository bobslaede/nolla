'use strict';

angular.module('nolla.calendar')
  .directive('nlEvent', function ($compile, $rootScope) {
    return {
      restrict: 'A',
      require: '^nlCalendar',
      scope: {
        event : '=nlEvent'
      },
      controller : function ($scope) {

      },
      compile: function ($scope, element, attrs, calendar) {
      }
    };

  });