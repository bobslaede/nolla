'use strict';

angular.module('nolla.calendar', [
    '$strap.directives'])
  .directive('nlCalendar', function ($modal, $q) {
    return {
      restrict: 'A',
      templateUrl: 'views/partials/calendar/index.html',
      scope : {
        calendar: '=nlCalendar'
      },
      replace: true,
      controller : function ($scope, $q) {
        var self = this;

        $scope.title = '';
        $scope.events = [];
        $scope.activeEvent = undefined;

        this.update = function () {
          $scope.$emit('calendar-update-date', $scope.calendar.date);
          self.draw();
        };

        this.editEvent = function (eventObj) {
          console.log('edit event', eventObj);
        };

        this.newEvent = function (eventObj) {
          console.log('new event', eventObj);
          var scope = $scope.$new();
          scope.model = {
            event: eventObj
          };
          scope.save = function () {
            console.log('save');
          };
          scope.delete = function () {
            console.log('delete');
          };
          var modal = $modal({
            template: '/views/partials/calendar/event.html',
            scope: scope,
            backdrop: false
          });
        };

        this.createEventObjectFromPartial = function (partial) {
          var obj = angular.extend({
            start: moment(),
            end: moment(),
            client: undefined,
            calendar: undefined,
            allday: false,
            summary: ''
          }, partial)
          return obj;
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
          if (!$scope.calendar.events) {
            return;
          }
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