'use strict';

angular.module('nolla.calendar')
  .directive('nlCalendarMonthEvent', function ($window) {

    var getParent = function (ele) {
      var parent = ele.parentNode;
      if (parent.classList.contains('month')) {
        return parent;
      }
      return getParent(parent);
    };

    return {
      restrict: 'A',
      require: ['^nlCalendarMonth'],
      scope : {
        nlCalendarMonthEvent: '='
      },
      controller : function ($scope) {

      },
      compile : function (element, attrs) {

        return function ($scope, element, attrs, controllers) {

          var event = $scope.nlCalendarMonthEvent;
          var date = event.date;
          $scope.group = event;
          var parent = getParent(element[0]).querySelector('table');
          var cell = parent.querySelector('.event-placeholder[data-date="' + date + '"]');

        }
      }
    };

  });