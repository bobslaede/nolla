'use strict';

angular.module('nolla.calendar')
  .directive('nlCalendarMonth', function ($timeout, $compile) {

    return {
      restrict: 'A',
      templateUrl: 'views/partials/calendar/month.html',
      replace: true,
      require: '^nlCalendar',
      controller : function ($scope) {

      },
      link : function ($scope, element, attrs, calendar) {
        $scope.calendarCtrl = calendar;

        $scope.weeks = [];
        $scope.range = undefined;
        $scope.start = undefined;
        $scope.end = undefined;
        $scope.today = undefined;

        $scope.$on('calendar-draw', function () {
          $scope.update();
        });

        $scope.dayNames = [];
        var m = moment().startOf('week');
        for (var i = 0, l = 7; i < l; ++i) {
          $scope.dayNames.push(m.format('ddd'));
          m.add('days', 1);
        }

        var createHtml = function () {
          var html = '<table class="month-table"><thead><tr class="month-header month-row">';
          // header
          html += '<td class="week-number">&nbsp;</td>';
          $scope.dayNames.forEach(function (day) {
            html += '<td class="day">' + day + '</td>';
          });
          html += '</tr></thead>';

          html += '<tbody class="month-content">';
          $scope.weeks.forEach(function (week) {
            html += '<tr class="month-row">'

              + '<td class="week-number">'
                + '<div class="title">' + week.number + '</div>'
              + '</td>';

            week.forEach(function (day) {
              var cls = '';
              cls += !day.currentMonth ? 'othermonth ' : '';
              cls += day.isPast ? 'past ': '';
              cls += day.dateString == $scope.todayString ? 'today ' : '';

              html += '<td class="day ' + cls + '">'
                + '<div class="title">' + day.dayString + '</div>'
                + '<div class="event-placeholder" data-date="' + day.dateString + '"></div>'
                + '</td>'
            });

            html += '</tr>';
          })
          html += '</tbody></table>';

          element.find('.month-view').html(html);
        };

        $scope.update = function () {

          $scope.currentMonth = $scope.calendar.date.month();
          $scope.today = moment().startOf('day');
          $scope.todayString = $scope.today.format('L');

          var start = moment($scope.calendar.date).startOf('month').startOf('week');
          var end = moment($scope.calendar.date).endOf('month').endOf('week');

          $scope.start = start;
          $scope.end = end;

          $scope.range = start
            .twix(end, true);

          $scope.calendar.range = $scope.range;
          $scope.calendarCtrl.getEvents();

          $scope.draw();
        };

        $scope.positionEvents = _.throttle(function () {
          $timeout(function () {

            element.find('.events').each(function () {
              var events = $(this);
              var date = events.data('date');
              var placeholder = element.find('.event-placeholder[data-date="' + date + '"]');
              placeholder.append(events);
            })

          }, 0, false);
        }, 10);

        $scope.draw = function () {
          var iter = $scope.range.iterate('days');
          var weeks = [];
          var day, i = 0, w = 0;

          while (day = iter.next()) {
            var week = weeks[w] ? weeks[w] : weeks[w] = [];
            day.dateString = day.format('L');
            day.dayString = day.format('D');
            day.currentMonth = day.isSame($scope.calendar.date, 'month');
            day.isPast = day.isBefore($scope.today);
            week.push(day);
            week.number = day.isoWeek();
            i += 1;
            w += (i % 7 === 0 ? 1 : 0);
          }
          $scope.weeks = weeks;
          createHtml();
          $scope.positionEvents();
        };



        $scope.groupedEvents = {};

        $scope.$watch('events', function () {
          $scope.groupedEvents = {};
          _.each($scope.events, function (origEvent) {

            var start = moment(origEvent.start.dateTime);
            var end = moment(origEvent.end.dateTime);

            var isSame = start.isSame(end, 'day');

            var startL = start.format('L');
            var endL = end.format('L');

            var event = {};
            event.original = origEvent;
            event.start = start;
            event.end = end;
            event.isSame = isSame;

            var group;
            if ($scope.groupedEvents[startL]) {
              group = $scope.groupedEvents[startL];
            } else {
              group = $scope.groupedEvents[startL] = {
                events : [],
                date : startL
              };
            }
            group.events.push(event);
          });
          $scope.positionEvents();
        })

        calendar.draw();
      }
    };
  });