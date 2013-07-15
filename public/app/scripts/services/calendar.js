'use strict';

angular.module('nolla')
  .provider('calendar', function () {
    console.log('calendar service');

    this.$get = ['$serviceScope', function ($serviceScope) {
      var $scope = $serviceScope();
      
      $scope.date = moment();
      $scope.dayNames = [];
      $scope.currentMonth = $scope.date.month();
      $scope.today = moment().startOf('day');
      $scope.todayString = $scope.today.format('LL');
      
      var m = moment().startOf('week');
      var dayNames = [];
      for (var i = 0, l = 7; i < l; ++i) {
        dayNames.push(m.format('ddd'));
        m.add('days', 1);
      }
      $scope.dayNames = dayNames;
      
      $scope.weeks = [];
      $scope.week = [];
      $scope.day = [];
      
      var update = function () {
        $scope.currentMonth = $scope.date.month();
        $scope.calcMonth();
        $scope.$broadcast('update');
      };
      
      $scope.calcMonth = function () {
        var date = $scope.date;
        
        var start = moment(date).startOf('month').startOf('week');
        var end = moment(date).endOf('month').endOf('week');
        var range = moment.twix(start, end);

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
        $scope.$update('weeks', weeks);
      };
      
      $scope.setDate = function(date) {
        $scope.$update('date', moment(date));
        update();
      };
      
      $scope.nextMonth = function () {
        $scope.date.add(1, 'months');
        update();
      };
      $scope.prevMonth = function () {
        $scope.date.subtract(1, 'months');
        update();
      };
      
      update();

      return $scope;

    }];

  });