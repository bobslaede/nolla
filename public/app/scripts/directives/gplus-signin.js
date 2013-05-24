'use strict';

angular.module('nolla')
  .directive('gplusSignin', function (gapi) {
    return {
      restrict: 'E',
      scope : {},
      transclude : true,
      template : '<button type="button" ng-transclude></button>',
      link: function link(scope, element, attrs) {
        gapi.gPlusSignin(element.find('button')[0], function (response) {
          console.log('sigin i')
          scope.$emit('gplus-sign-in', response);
        });
      }
    };
  });