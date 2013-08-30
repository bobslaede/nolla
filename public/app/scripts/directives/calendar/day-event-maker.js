'use strict';


angular.module('nolla.calendar')
  .directive('nlMakeDayEvent', function ($timeout, eventsHelpers) {
    return {
      link: function (scope, element, attrs) {
        var snap = 10; // minutes
        var MINUTES_IN_DAY = (24 * 60);
        var snapPercentage = (snap / MINUTES_IN_DAY) * 100;

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

        var start = moment().startOf('day');
        var end = moment().startOf('day');

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

        var updateGhostWithTime = function () {
          start.startOf('day').add('minutes', startMinute)
          end.startOf('day').add('minutes', endMinute);

          var str = start.format('HH:mm') + ' - ' + end.format('HH:mm');
          ele.html(str);
        };

        element
          .on('mousedown', function (e) {
            if (e.button === 0) {
              active = true;
              $('.event-ghost').remove(); // remove all old ghosts
              element.append(ele);
              y1 = e.offsetY;
              tHeight = this.offsetHeight;
              positionEle(e);
            }
          })
          .on('mousemove', function (e) {
            if (active === true) {
              e.preventDefault();
              positionEle(e);
            }
          })
        $(document)
          .on('mouseup', function (e) {
            if (active) {
              active = false;
              ele.remove();
            }
          })
      }
    }
  });