'use strict';

angular.module('nolla')
  .directive('nlCalendarMonth', function () {
    return {
      restrict: 'A',
      templateUrl: 'views/partials/calendar-month.html',
      scope : {
        calendar: '='
      },
      controller : ['$scope', function ($scope) {
        console.log('Calendar month controller')
      }],
      link : function (scope, element, attrs) {
        console.log('calendar month link')
      }
    };
  });