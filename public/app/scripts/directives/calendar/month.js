'use strict';

angular.module('nolla.calendar')
  .directive('nlCalendarMonth', function () {

    return {
      restrict: 'A',
      templateUrl: 'views/partials/calendar/month.html',
      replace: true,
      require: '^nlCalendar',
      controller : function ($scope) {
        var self = this;

        $scope.weeks = [];
        $scope.range = undefined;
        $scope.start = undefined;
        $scope.end = undefined;
        $scope.today = undefined;

        $scope.$on('calendar-draw', function () {
          self.update();
        });

        $scope.dayNames = [];
        var m = moment().startOf('week');
        for (var i = 0, l = 7; i < l; ++i) {
          $scope.dayNames.push(m.format('ddd'));
          m.add('days', 1);
        }

        this.update = function () {

          $scope.currentMonth = $scope.calendar.date.month();
          $scope.today = moment().startOf('day');

          var start = moment($scope.calendar.date).startOf('month').startOf('week');
          var end = moment($scope.calendar.date).endOf('month').endOf('week');

          $scope.start = start;
          $scope.end = end;

          $scope.range = start
            .twix(end, true);

          $scope.calendar.range = $scope.range;
          $scope.calendarCtrl.getEvents();

          this.draw();
        };

        this.draw = function () {
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

      },
      link : function ($scope, element, attrs, calendar) {
        $scope.calendarCtrl = calendar;
        calendar.draw();
      }
    };
  });