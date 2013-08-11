'use strict';

angular.module('nolla')
  .directive('nlJournalEntryHelper', function () {
    return {
      restrict: 'A',
      link: function postLink(scope, element, attrs) {
        element.on('dragstart', function (e) {
          var data = JSON.stringify(scope[attrs.nlJournalEntryHelper]);
          console.log(data);
          e.originalEvent.dataTransfer.setData('application/json', data);
        })

      }
    };
  });