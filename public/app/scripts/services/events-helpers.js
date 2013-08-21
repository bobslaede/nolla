'use strict';

angular.module('nolla')
  .factory('eventsHelpers', function ($log, $serviceScope) {
    $log.info('EventsHelpers service');

    var _wrapInMoment = function (events) {
      _.map(events, function (event) {
        event.start.date = moment(event.start.dateTime);
        event.end.date = moment(event.end.dateTime);
      })
      return events;
    };

    var _sortEvents = function (originalEvents) {
      originalEvents.sort(function (a, b) {
        return a.start.date.diff(b.start.date) || b.end.date.diff(b.start.date) - a.end.date.diff(a.start.date);
      });
      return originalEvents;
    };

    var _isWholeDayEvent = function (event) {
      return event.allday;
    };

    var create = function (originalEvents) {
      _wrapInMoment(originalEvents);
      _sortEvents(originalEvents);

      var events = _.filter(_sortEvents, function (event) {
        return !_isWholeDayEvent(event);
      });

      return events;
    };

    return {
      organizeEventsByDay: organizeEventsByDay,
    }

  });