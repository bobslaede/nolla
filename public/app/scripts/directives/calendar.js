'use strict';

angular.module('nolla')
  .directive('nlCalendar', function () {
    return {
      restrict: 'A',
      templateUrl: 'views/partials/calendar.html',
      scope : {
        date: '='
      },
      controller : ['$scope', function ($scope) {
        console.log('calendar month ctrl')

        $scope.dayNames = [];
        $scope.currentMonth = undefined;
        $scope.today = undefined;
        $scope.todayString = undefined;
        $scope.range = undefined;

        $scope.title = '';

        $scope.weeks = [];

        var m = moment().startOf('week');
        for (var i = 0, l = 7; i < l; ++i) {
          $scope.dayNames.push(m.format('ddd'));
          m.add('days', 1);
        }

        var update = function () {
          if ($scope.date) {
            $scope.currentMonth = $scope.date.month();
            $scope.today = moment().startOf('day');

            $scope.range = moment($scope.date).startOf('month').startOf('week')
              .twix(moment($scope.date).endOf('month').endOf('week'), true);

            $scope.getWeeks();
            $scope.$emit('update-calendar');
          }
        };

        $scope.getWeeks = function () {
          var iter = $scope.range.iterate('days');
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
          update();
        });

        $scope.$on('update-date', function () {
          update();
        });

        return $scope;

      }],
      link : function (scope, element, attrs) {
        console.log('calendar month link')
      }
    };
  });