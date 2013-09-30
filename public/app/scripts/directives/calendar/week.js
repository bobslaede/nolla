'use strict';

angular.module('nolla.calendar')
  .directive('nlCalendarWeek', function ($timeout, eventsHelpers, $compile) {

    var range = function (from, to) {
      var r = Array.apply(null, { length: to }).map(Number.call, Number);
      return r.slice(from, to);
    }

    var zeroPrefix = function (n, a) {
      return ("000000000000" + n).slice(-a);
    }

    var hourFormat = function (n) {
      return zeroPrefix(n, 2) + ":00";
    }

    return {
      restrict: 'A',
      templateUrl: 'views/partials/calendar/week.html',
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
        $scope.startHour = 8;

        /*
        $scope.hours = [];
        var range = moment().startOf('day').twix(moment().endOf('day'));
        var iter = range.iterate('hours');
        var h;
        while (h = iter.next()) {
          $scope.hours.push(h.format('HH:mm'));
        }
        */
        $scope.hours = range(0, 24).map(hourFormat);

        $scope.$on('calendar-draw', function () {
          $scope.update();
        });

        $scope.dayNames = [];

        var formatHour = function (n) {
          return ("00" + n).substr(-2) + ":00";
        };

        var createHtml = function () {
          var html = '';

          var createHourDivs = function (showHours) {
            var html = '';
            for (var i = 0, l = 24; i < l; ++i) {
              html += '<div class="hour-div" data-hour="' + i + '">' + (showHours ? formatHour(i) : '') + '</div>';
            }
            return html;
          };

          var getDayName = function (day) {
            return day.dayName;
          };

          var getDayEventPlaceholder = function (day) {
            var html = '<div class="event-placeholder" data-date="' + day.dateString + '"></div>';
            return html;
          };

          var getDayClasses = function (day) {
            var cls = '';
            cls += day.dateString == $scope.todayString ? 'today ' : '';
            cls += !day.currentMonth ? 'othermonth ' : '';
            cls += day.isPast ? 'past ': '';
            return cls;
          };

          var createDayTds = function (m) {
            var html = '';
            $scope.week.forEach(function (day) {
              var cls = getDayClasses(day);
              html += '<td class="day ' + cls + '">' + m(day) + '</td>';
            });
            return html;
          };

          var getTodayHourLine = function (day) {
            if (day.dateString == $scope.todayString) {
              var html = '';
              var now = moment();
              var minute = now.minute();
              var hour = now.hour();
              var totalMinutes = (hour * 60) + minute;
              var totalMinutesInDay = (24 * 60);
              var percentFromTop = (totalMinutes / totalMinutesInDay) * 100;
              html += '<div class="hour-line" style="top:' + percentFromTop + '%;"></div>'
              return html;
            }
            return '';
          };

          var getDayHtml = function (day) {
            var html = '<div class="day-holder" nl-make-day-event="' + day.dateString + '">'
              + createHourDivs(false)
              + getDayEventPlaceholder(day)
              + getTodayHourLine(day)
              + '</div>';
            return html;
          };

          html += ''
            + '<div class="week-header">'
              + '<table class="week-table">'
              + '<thead>'
              + '<tr>'
                + '<td class="week-table-hour-column">'
                  + '<div class="title">' + $scope.week.number + '</div>'
                + '</td>'
                + '<td>'
                  + '<table class="week-table-header">'
                  + '<tbody>'
                    + '<tr>'
                      + createDayTds(getDayName)
                    + '</tr>'
                  + '</tbody>'
                  + '</table>'
                +' </td>'
                + '</tr>'
              + '</thead>'
              + '</table>'
            + '</div>'
            + '<div class="week-body">'
              + '<table class="week-table">'
              + '<tbody>'
                + '<tr>'
                  + '<td class="week-table-hour-column">'
                    + createHourDivs(true)
                  + '</td>'
                  + '<td>'
                    + '<div class="week-table-body-parent">'
                      + '<table class="week-table-body">'
                      + '<tbody>'
                        + '<tr>'
                          + createDayTds(getDayHtml)
                        + '</tr>'
                      + '</tbody>'
                      + '</table>'
                    + '</div>'
                  + '</td>'
                + '</tr>'
              + '</tbody>'
              + '</table>'
            + '</div>';


          var ele = angular.element(html);
          //var compiled = $compile(ele);
          //element.find('.week-view').html(compiled($scope));
          var parent = element.find('.week-view').html('');
          parent.append(ele);
          $compile(ele)($scope);

          var scrollTo = element.find('.hour-line')[0] || element.find('[data-hour="' + $scope.startHour + '"]')[0];
          scrollTo && scrollTo.scrollIntoView(true);
        };

        $scope.update = function () {

          $scope.currentMonth = $scope.calendar.date.month();
          $scope.today = moment().startOf('day');
          $scope.todayString = $scope.today.format('L');

          var start = moment($scope.calendar.date).startOf('week');
          var end = moment($scope.calendar.date).endOf('week');

          $scope.start = start;
          $scope.end = end;

          $scope.range = start
            .twix(end, true);

          $scope.calendar.range = $scope.range;
          $scope.calendarCtrl.getEvents();

          $scope.draw();
        };

        $scope.draw = function () {
          var iter = $scope.range.iterate('days');
          var week = [];
          var day, i = 0, w = 0;

          week.number = $scope.calendar.date.isoWeek();

          while (day = iter.next()) {
            day.dateString = day.format('L');
            day.dayString = day.format('D');
            day.currentMonth = day.isSame($scope.calendar.date, 'month');
            day.isPast = day.isBefore($scope.today);
            day.isToday = day.isSame($scope.today, 'day');
            day.dayName = day.format('ddd D/M');
            week.push(day);
          }
          $scope.week = week;
          createHtml();
        };

        $scope.positionEvents = function () {

        };

        $scope.groupedEvents = [];

        $scope.$watch('events', function () {
          $scope.groupedEvents = [];

          var minInDay = 60 * 24;

          _.each($scope.events, function (origEvent) {
            var start = moment(origEvent.start.dateTime);
            var end = moment(origEvent.end.dateTime);
            var event = {};
            event.original = origEvent;
            event.pos = {};
            event.pos.left = start.day() * (100 / 7);

            var startMinute = (start.hour() * 60) + start.minute();
            event.pos.top = (startMinute / minInDay) * 100;

            var endMinute = (end.hour() * 60) + end.minute();
            event.pos.bottom = (startMinute / minInDay) * 100;

            console.log(start.format('LLLL'), end.format('LLLL'));

            $scope.groupedEvents.push(event);
          });
          $scope.positionEvents();
        })

        calendar.draw();
      }
    };
  });