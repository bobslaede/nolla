'use strict';

angular.module('nolla')
  .controller('CalendarCtrl', ['$scope', '$state', function ($scope, $state) {
    console.log('CalendarCtrl');

    var month = moment().month();
    $scope.month = month;

    $scope.today = moment();

    var start = moment().startOf('month').startOf('week');
    var end = moment().endOf('month').endOf('week');
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

    var m = moment().startOf('week');
    var dayNames = [];
    for (var i = 0, l = 7; i < l; ++i) {
      dayNames.push(m.format('ddd'));
      m.add('days', 1);
    }
    $scope.dayNames = dayNames;

  }]);
