'use strict';

angular.module('nolla')
  .directive('nlJournalEntry', function () {
    return {
      restrict: 'A',
      controller : function ($scope) {
      },
      link: function postLink(scope, element, attrs) {

        var model = scope[attrs['nlJournalEntry']];

        element.on('dragover dragenter', function (e) {
          e.preventDefault();
        });

        element.on('drop', function (e) {
          e.preventDefault();
          if (scope.entry.locked) {
            return;
          }
          var data = e.originalEvent.dataTransfer && e.originalEvent.dataTransfer.getData('application/json');
          var obj = JSON.parse(data);
          var toSave = {};
          toSave.origin = obj._id;
          toSave.description = obj.description;
          toSave.originaldescription = obj.description;
          toSave.name = obj.name;
          model.entryData.push(toSave);
        })

      }
    };
  });