'use strict';

angular.module('nolla')
  .directive('nlFormAutosave', function () {
    return {
      restrict: 'A',
      link: function postLink(scope, element, attrs) {

        var save = _.debounce(function () {
          element.trigger('submit');
        }, 500);

        element.on('input', 'input,select,textarea', function (e) {
          save();
        });
      }
    };
  });