'use strict';


angular.module('nolla.calendar')
  .directive('nlMakeDayEvent', function ($timeout, eventsHelpers, $document) {
    return {
      scope: true,
      require: '^nlCalendar',
      link: function (scope, element, attrs, calendar) {
        var date = attrs.nlMakeDayEvent;
        var format = moment().lang().longDateFormat('L');
        var snap = 10; // minutes
        var MINUTES_IN_DAY = (24 * 60);
        var snapPercentage = (snap / MINUTES_IN_DAY) * 100;
        var KEY_ESC = 27;

        var active = false;

        element.attr('draggable', 'false');

        var ele = $('<div class="event-ghost" draggable="false"></div>');

        var y1 = 0;
        var y2 = 0;

        var top = 0;
        var bottom = 0;
        var height = 0;

        var tHeight = 0;

        var startMinute = 0;
        var endMinute = 0;

        var start = moment(date, format).startOf('day');
        var end = moment(date, format).startOf('day');

        var positionEle = function (e) {
          y2 = e.offsetY;
          top = Math.min(y1, y2);

          bottom = Math.max(y1, y2);


          var percentTop = (top / tHeight) * 100;
          var percentBottom = (bottom / tHeight) * 100;
          var snapTop = snapPercentage * Math.floor(percentTop / snapPercentage);
          var snapBottom = snapPercentage * Math.ceil(percentBottom / snapPercentage);

          height = snapBottom - snapTop;

          startMinute = Math.ceil((MINUTES_IN_DAY / 100) * snapTop);
          endMinute = Math.ceil((MINUTES_IN_DAY / 100) * snapBottom);

          ele.css({
            top: snapTop + '%',
            height: height + '%'
          })

          updateGhostWithTime();
        };

        var createNewEvent = function () {
          var eventObj = calendar.createEventObjectFromPartial({
            start: start,
            end: end
          });
          calendar.newEvent(eventObj);
        };

        var updateGhostWithTime = function () {
          start.startOf('day').add('minutes', startMinute)
          end.startOf('day').add('minutes', endMinute);

          var str = start.format('HH:mm') + ' - ' + end.format('HH:mm');
          ele.html(str);
        };

        var setActive = function (flag) {
          $('body').toggleClass('event-drag-y', flag);
        };

        element
          .on('mousedown', function (e) {
            if (e.button === 0) {
              e.originalEvent.preventDefault();
              ele.active = true;
              $('.event-ghost').remove(); // remove all old ghosts
              element.append(ele);
              y1 = e.offsetY;
              tHeight = this.offsetHeight;
              positionEle(e);
              setActive(ele.active);
            }
          })
          .on('mousemove', function (e) {
            if (ele.active === true) {
              positionEle(e);
              e.originalEvent.preventDefault();
              e.preventDefault();
              ele[0].scrollIntoViewIfNeeded(false);
            }
          })
          .on('mouseup', function (e) {
            if (ele.active) {
              createNewEvent();
            }
          });
        $($document)
          .on('mouseup', function (e) {
            if (ele.active) {
              e.originalEvent.preventDefault();
              active = false;
              ele.remove();
              setActive(active);
            }
          })
          .on('keydown', function (e) {
            if (ele.active) {
              if (e.which == KEY_ESC) {
                e.originalEvent.preventDefault();
                ele.active = false;
                ele.remove();
                setActive(ele.active);
              }
            }
          })
      }
    }
  });