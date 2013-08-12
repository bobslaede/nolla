'use strict';

angular.module('nolla')
  .controller('Calendar', function ($scope, $state, $log, sync) {
    $log.log('Calendar controller active')

    $scope.events = sync('events');
    $scope.events.getAll();

    $scope.calendar = {};
    $scope.calendar.date = moment();
    $scope.calendar.events = $scope.events;

  });
