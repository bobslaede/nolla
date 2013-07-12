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
    $scope.dateTitle = '';
    $scope.view = '';

    var update = function () {
      $scope.dateString = $scope.date.format();
      storage.set('calendar-date', $scope.dateString);
      switch ($scope.view) {
        case 'month':
        default:
          $scope.dateTitle = $scope.date.format('MMMM YYYY');
          break;
        case 'week':
          var tmp = moment($scope.date);
          $scope.dateTitle = tmp.startOf('week').format('LL') + ' - ' + tmp.endOf('week').format('LL')
          break;
      }
    }

    $scope.setView = function (view) {
      storage.set('calendar-view', view);
      $scope.view = view;
      update();
    };
    storage.get('calendar-date', $scope.date)
      .then(function (date) {
        $scope.date = moment(date);
        storage.get('calendar-view', 'month')
          .then(function (view) {
            $scope.view = view;
            update();
          });
      });

    $scope.isView = function (view) {
      return $scope.view == view;
    }

    $scope.next = function () {
      var step =  $scope.view == 'month'    ?   'months' :
                  $scope.view == 'week'     ?   'weeks'  :
                  $scope.view == 'day'      ?   'days'   :
                  'month';

      $scope.date.add(1, step);

      update();
    };

    $scope.prev = function () {

      var step =  $scope.view == 'month'    ?   'months' :
        $scope.view == 'week'     ?   'weeks'  :
          $scope.view == 'day'      ?   'days'   :
            'month';

      $scope.date.subtract(1, step);

      update();
    };

    $scope.today = function () {
      $scope.date = moment();

      update();
    };


  }]);
