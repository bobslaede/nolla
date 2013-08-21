'use strict';

angular.module('nolla')
  .controller('Calendar', function ($scope, $state, $log, sync, storage) {
    $log.log('Calendar controller active')

    $scope.events = sync('events');
    $scope.events.getAll();

    $scope.calendar = {};
    $scope.calendar.date = moment();
    $scope.calendar.events = $scope.events;

    storage.get('calendar-view', 'month')
      .then(function (view) {
        $scope.calendar.view = view;
      });
    storage.get('calendar-date', moment())
      .then(function (date) {
        $scope.calendar.date = moment(date);
      });

    $scope.$on('calendar-update-view', function (e, view) {
      storage.set('calendar-view', view);
    });

    $scope.$on('calendar-update-date', function (e, date) {
      storage.set('calendar-date', date);
    });

  });
