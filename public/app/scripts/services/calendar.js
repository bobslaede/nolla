'use strict';

angular.module('nolla')
  .provider('calendar', function () {
    console.log('calendar service');

    this.$get = ['$serviceScope', function ($serviceScope) {
      var $scope = $serviceScope();

      $scope.date = moment();

      $scope.dayNames = [];
      $scope.currentMonth = undefined;
      $scope.today = undefined;
      $scope.todayString = undefined;
      $scope.range = undefined;

      $scope.title = '';
      $scope.view = 'month';

      $scope.weeks = [];
      $scope.days = [];

      var m = moment().startOf('week');
      for (var i = 0, l = 7; i < l; ++i) {
        $scope.dayNames.push(m.format('ddd'));
        m.add('days', 1);
      }

      var update = function () {
        $scope.currentMonth = $scope.date.month();
        $scope.today = moment().startOf('day');
        $scope.todayString = $scope.today.format('LL');
        var allDay = $scope.view !== 'day';

        console.log('scope view', $scope.view, allDay);

        switch ($scope.view) {
          case 'month':
            $scope.range = $scope.date.startOf('month').startOf('week')
              .twix(moment($scope.date).clone().endOf('month').endOf('week'), allDay);
            break;
        }

        $scope.title = $scope.range.simpleFormat('L', { allDay : allDay == true ? null : ''});
        $scope.getWeeks();
        $scope.$broadcast('update');
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

      $scope.next = function () {
        $scope.date.add(1, 'months');
        update();
      };

      $scope.prev = function () {
        $scope.date.subtract(1, 'months');
        update();
      };

      $scope.today = function () {
        $scope.date = moment();
        update();
      };

      $scope.$watch('view', function () {
        update();
      });

      return $scope;

    }];

  });