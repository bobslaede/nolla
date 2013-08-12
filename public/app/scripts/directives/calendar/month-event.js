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
      require: '^nlCalendarMonth',
      controller : function ($scope) {

      },
      link : function ($scope, element, attrs, month) {
        var start = moment($scope.event.start.dateTime);
        var end = moment($scope.event.end.dateTime);
        var parent = getParent(element[0]);
        var cell = parent.querySelector('[data-date="' + start.format('L') + '"]');
        console.log(cell);

        var position = function () {
          var x = cell.offsetLeft;
          var y = cell.offsetTop;
          console.log(x, y);
          element.css({
            left : x,
            top: y
          });
        };

        $window.addEventListener('resize', _.debounce(position, 100), false);
        position();

      }
    };

  });