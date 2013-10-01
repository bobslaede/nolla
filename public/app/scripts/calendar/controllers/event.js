'use strict';

angular.module('nolla.calendar')
  .controller('EventCtrl', function ($scope, sync) {

    var newEvent = angular.copy($scope.model.event);
    var origEvent = $scope.model.event;
    if (newEvent.$unwrap) {
      newEvent.$unwrap();
    }
    $scope.model.event = newEvent;
    console.log(newEvent);

    this.save = function () {
      console.log(origEvent.start.format());
      for (var k in newEvent) {
        if (newEvent.hasOwnProperty(k)) {
          origEvent[k] = newEvent[k];
        }
      }
      if (origEvent.id && origEvent.$save) {
        origEvent.$save();
      } else {
        var events = $scope.events;
        events.add(origEvent);
      }
    };

  });