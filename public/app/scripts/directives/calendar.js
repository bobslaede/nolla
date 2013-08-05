'use strict';

angular.module('nolla')
  .directive('nlCalendar', function () {
    return {
      restrict: 'A',
      templateUrl: 'views/partials/calendar.html',
      scope : {
        nlCalendar: '='
      },
      replace: true,
      controller : ['$scope', function ($scope) {
        console.log('calendar month ctrl')

        $scope.calendar = $scope.nlCalendar;
        $scope.dayNames = [];
        $scope.currentMonth = undefined;
        $scope.today = undefined;
        $scope.todayString = undefined;
        $scope.range = undefined;

        $scope.model = {};

        $scope.title = '';

        $scope.weeks = [];

        var m = moment().startOf('week');
        for (var i = 0, l = 7; i < l; ++i) {
          $scope.dayNames.push(m.format('ddd'));
          m.add('days', 1);
        }

        var update = function () {
          if ($scope.calendar.date) {
            $scope.currentMonth = $scope.calendar.date.month();
            $scope.today = moment().startOf('day');

            $scope.range = moment($scope.calendar.date).startOf('month').startOf('week')
              .twix(moment($scope.calendar.date).endOf('month').endOf('week'), true);

            $scope.getWeeks();
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

        $scope.setView = function (view) {
          $scope.calendar.view = view;
        };

        $scope.setToday = function () {
          $scope.calendar.date = moment();
        };

        $scope.go = function (n) {
          var view = $scope.calendar.view;
          var method = n > 0 ? 'add' : 'subtract';
          var type = view == 'week' ? 'weeks' :
                     view == 'day' ? 'days'  :
                       'months';

          $scope.calendar.date = $scope.calendar.date[method](Math.abs(n), type).clone();
        };

        $scope.createEvent = function (data) {
          $scope.calendar.events.add(data);
        };

        $scope.addEvent = function (date) {
          console.log('add event', date);
          $scope.model.currentEvent = {};
          $scope.model.currentEvent.start = date;
          $scope.model.currentEvent.end = date;
        };

        $scope.$watch('nlCalendar', function () {
          console.log('watched nlCalendar')
          update();
        });

        $scope.$watch('calendar.date', function () {
          console.log('watch from inside')
          update();
        });

        return $scope;

      }],
      link : function (scope, element, attrs) {
        var cal = element.find('.calendar');
        cal.height(cal.height());
        $(window).on('resize', _.debounce(function () {
          cal.css('min-height', '0');
          cal.css('min-height', cal.height());
        }, 200));
      }
    };
  });