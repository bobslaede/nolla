'use strict';

angular.module('nolla.calendar')
  .service('calendarEventService', function ($rootScope, $modal) {

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

    this.editEvent = function (eventObj) {
      console.log('edit event', eventObj);
    };

    this.showEventModal = function (eventObj, eventsList) {
      var scope = $rootScope.$new();
      scope.model = {
        event: eventObj
      };
      scope.events = eventsList;
      var modal = $modal({
        template: '/views/partials/calendar/event.html',
        scope: scope,
        backdrop: true
      });
      scope.$watch('model', function () {
        console.log('new event changed', scope.model);
      })
    }

    this.newEvent = function (eventObj, eventsList) {
      console.log('new event', eventObj);
      this.showEventModal(eventObj, eventsList);
    };

  });