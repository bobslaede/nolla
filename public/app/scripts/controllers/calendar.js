'use strict';

angular.module('nolla')
  .controller('CalendarCtrl', function ($scope, $state, storage, calendars, events) {
    console.log('CalendarCtrl');

    $scope.dateTitle = '';

    $scope.calendar = {};

    events.getAll();

    $scope.calendar.events = events;

    console.log(events);

    storage.get('calendar-date', moment().format())
      .then(function (date) {
        $scope.calendar.date = moment(date);
      });

    storage.get('calendar-view', 'month')
      .then(function (view) {
        $scope.calendar.view = view;
      });

    $scope.$watch('calendar.view', function () {
      storage.set('calendar-view', $scope.calendar.view);;
    });

    $scope.$watch('calendar.date', function () {
      $scope.calendar.date && storage.set('calendar-date', $scope.calendar.date.format());

    });

    $scope.$on('calendar-update', function () {
      if ($scope.calendar.range) {
        var query = {
          'start.dateTime' : {
            '$gte' : $scope.calendar.range.start.format()
          },
          'end.dateTime' : {
            '$lte' : $scope.calendar.range.end.format()
          }
        };
        events.query(query);
      }
    });

    $scope.addCalendar = function () {
      calendars.add({})
        .then(function (newCal) {

        });
    };

    $scope.setDate = function (date) {
      $scope.calendar.date = moment(date);
    };

    calendars.getAll();
    $scope.calendars = calendars;
    $scope.calendar.calendars = calendars;
  });
