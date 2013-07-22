'use strict';

angular.module('nolla')
  .controller('CalendarCtrl', function ($scope, $state, storage, calendars) {
    console.log('CalendarCtrl');

    $scope.dateTitle = '';

    calendars.getAll();
    $scope.calendars = calendars;

    storage.get('calendar-date', moment().format())
      .then(function (date) {
        $scope.date = moment(date);
      });

    $scope.view = storage.get('calendar-view', 'month');

    $scope.setView = function (view) {
      $scope.view = storage.set('calendar-view', view);
    };

    $scope.addCalendar = function () {
      calendars.add({})
        .then(function (newCal) {

        })
    };

    $scope.setDate = function (date) {
      $scope.date = moment(date);
      $scope.$broadcast('update-date');
    };

    $scope.setWeek = function (date) {
      $scope.setView('week');
      $scope.setDate(date);
    };

    $scope.next = function () {
      $scope.date.add(1, 'months');
      $scope.$broadcast('update-date');
    };

    $scope.prev = function () {
      $scope.date.subtract(1, 'months');
      $scope.$broadcast('update-date');
    };

    $scope.today = function () {
      $scope.date = moment();
      $scope.$broadcast('update-date');
    };

    $scope.$on('update-calendar', function () {
      storage.set('calendar-date', $scope.date.format());
    });

  });
