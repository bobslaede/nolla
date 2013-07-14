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
        
        var hour = moment();
        var hours = [];
        for (var i = 0, l = 24; i < l; ++i) {
            hours.push(hour.hour(i).format('HH'));
        }
        $scope.hours = hours;
        

        var calcWeek = function () {
          if (!date) return;

          var month = date.month();
          $scope.month = month;
          var start = moment(date).startOf('week');
          var end = moment(date).endOf('week');
          var range = moment.twix(start, end);

          console.log('calcing week', start.format('L'), end.format('L'))

          var iter = range.iterate('days');
          var day;

          var days = [];
          while (day = iter.next()) {
            days.push(day);
          }

          $scope.days = days;

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