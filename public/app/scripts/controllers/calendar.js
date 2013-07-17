'use strict';

angular.module('nolla')
  .controller('CalendarCtrl', function ($scope, $state, storage, calendars) {
    console.log('CalendarCtrl');

    $scope.dateTitle = '';

    calendars.getAll();
    $scope.calendars = calendars;


    $scope.date = moment();

    $scope.view = storage.get('calendar-view', 'month');

    $scope.setView = function (view) {
      $scope.view = storage.set('calendar-view', view);
    };

    $scope.addCalendar = function () {
      calendars.add({})
        .then(function (newCal) {

        })
    };

    $scope.next = function () {
      $scope.date.add(1, 'months');
      console.log('emit update')
      $scope.$broadcast('update-date');
    };

    $scope.prev = function () {
      $scope.date.subtract(1, 'months');
      $scope.$broadcast('update-date');
    };

    $scope.today = function () {
      $scope.date = moment();
      $scope.$broadcast('update-date');
    }

  });
