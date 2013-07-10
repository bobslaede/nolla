'use strict';

angular.module('nolla')
  .controller('CalendarCtrl', [
    '$scope',
    '$state',
    'storage',
    'calendar',
  function ($scope, $state, storage, calendar) {
    console.log('CalendarCtrl');

    $scope.dateString = '';
    $scope.date = moment();

    var update = function () {
      $scope.dateString = $scope.date.format();
      storage.set('calendar-date', $scope.dateString);
      $scope.dateTitle = $scope.date.format('MMMM YYYY');
    }

    $scope.dateTitle = '';

    $scope.view = '';

    $scope.setView = function (view) {
      storage.set('calendar-view', view);
      $scope.view = view;
    };
    storage.get('calendar-date', $scope.date)
      .then(function (date) {
        $scope.date = moment(date);
        storage.get('calendar-view', 'month')
          .then(function (view) {
            $scope.view = view;
          });
        update();
      });

    $scope.isView = function (view) {
      return $scope.view == view;
    }

    $scope.next = function () {
      $scope.date.add(1, 'month');

      update();
    };

    $scope.prev = function () {
      $scope.date.subtract(1, 'month');

      update();
    };


  }]);
