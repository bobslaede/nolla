'use strict';

angular.module('nolla.calendar', [
    '$strap.directives'])
  .directive('nlCalendar', function () {
    return {
      restrict: 'A',
      templateUrl: 'views/partials/calendar/index.html',
      scope : {
        nlCalendar: '='
      },
      replace: true,
      controller : function ($scope, $q) {
        var self = this;

        $scope.title = '';
        $scope.events = [];

        this.update = function () {
          $scope.$emit('calendar-update-date', $scope.calendar.date);
          self.draw();
        };

        this.draw = function () {
          $scope.$broadcast('calendar-draw');
          $scope.title = '';
          if (!$scope.calendar.date) return;

          switch ($scope.calendar.view) {
            case 'month':
            default:
              $scope.title = $scope.calendar.date.format('MMMM YYYY');
              break;
            case 'week':
              if (!$scope.calendar.range) {
                break;
              }
              $scope.title = $scope.calendar.range.start.format('L')
                  + ' - '
                  + $scope.calendar.range.end.format('L');
              break;
            case 'day':
              $scope.title = $scope.calendar.date.format('dddd LL');
              break;
          }
        };

        this.getEvents = function () {
          var find = angular.noop;
          if ($scope.calendar.range) {
            find = function (obj) {
              var inStart = $scope.calendar.range.contains(obj.start.dateTime);
              var inEnd = $scope.calendar.range.contains(obj.end.dateTime);
              return inStart || inEnd;
            };
          }
          var events = _.filter($scope.calendar.events.list, find);
          $scope.events = events;
        };

        $scope.$watch('calendar.events.list.length', function () {
          self.getEvents();
        });

        $scope.setView = this.setView = function (view) {
          $scope.calendar.view = view;
          $scope.$emit('calendar-update-view', view);
          self.draw();
        };

        $scope.go = this.go = function (n) {
          var view = $scope.calendar.view;
          var type = view == 'week' ? 'weeks' :
                     view == 'day'  ? 'days'  :
                     'month';
          var method = n > 0 ? 'add' : 'subtract';
          var amount = Math.abs(n);
          $scope.calendar.date[method](amount, type);
          self.update();
        };

        $scope.today = this.today = function () {
          if (!$scope.calendar.date.isSame(moment(), 'day')) {
            $scope.calendar.date = moment();
            self.update();
          }
        };

      },
      link : function ($scope, element, attrs, controller) {
        $scope.calendar = $scope.nlCalendar;
        if (!$scope.calendar) {
          $scope.calendar = {
            date : moment(),
            view : 'month'
          }
        }
        if (!$scope.calendar.date) {
          $scope.calendar.date = moment();
        }

        controller.draw();
      }
    };
  });