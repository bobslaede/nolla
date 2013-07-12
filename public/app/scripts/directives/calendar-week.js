'use strict';

angular.module('nolla')
  .directive('nlCalendarWeek', function () {
    return {
      restrict: 'A',
      templateUrl: 'views/partials/calendar-week.html',
      scope : {
        date: '='
      },
      controller : ['$scope', function ($scope) {

        var date = moment($scope.date);

        $scope.today = moment();

        var m = moment().startOf('week');
        var dayNames = [];
        for (var i = 0, l = 7; i < l; ++i) {
          dayNames.push(m.format('ddd'));
          m.add('days', 1);
        }
        $scope.dayNames = dayNames;

        var calcWeek = function () {
          if (!date) return;

          var month = date.month();
          $scope.month = month;
          var start = moment(date).startOf('week');
          var end = moment(date).endOf('week');
          var range = moment.twix(start, end);

          console.log('calcing week', start.format('L'), end.format('L'))

          var iter = range.iterate('days');
          var weeks = [];
          var day, i = 0, w = 0;

          while (day = iter.next()) {
            var week = weeks[w] ? weeks[w] : weeks[w] = [];
            week.push(day);
            week.number = day.isoWeek();
            i += 1;
            w += (i % 7 === 0 ? 1 : 0);
          }

          $scope.weeks = weeks;

        };

        $scope.$watch('date', function () {
          date = moment($scope.date);
          calcWeek();
        });

      }],
      link : function (scope, element, attrs) {

      }
    };
  });