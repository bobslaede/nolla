'use strict';

angular.module('nolla.calendar', [])
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
          switch ($scope.calendar.view) {
            case 'month':
            default:
              $scope.title = $scope.calendar.date.format('MMMM YYYY');
              break;
            case 'week':
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

      },
      link : function ($scope, element, attrs, controller) {
        $scope.calendar = _.extend({
          view: 'month'
        }, $scope.nlCalendar);

        controller.draw();
      }
    };
  });