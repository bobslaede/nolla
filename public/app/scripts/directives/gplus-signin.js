'use strict';

angular.module('nolla')
  .directive('gplusSignin', function (gapi) {
    return {
      restrict: 'E',
      scope : {
        signin : '&'
      },
      transclude : true,
      template : '<button type="button"></button>',
      controller : function ($scope, auth) {
        $scope._signin = function () {
          auth.getToken()
            .then(function (token) {
              if (token && token.access_token) {
                $scope.signin();
              }
            });
        };
      },
      link: function link(scope, element, attrs) {
        gapi.signin.render(element.find('button')[0], {
          'callback': scope._signin,
          'clientid': '75672706662.apps.googleusercontent.com',
          'cookiepolicy': 'none',
          'scope': 'https://www.googleapis.com/auth/plus.login'
        });
      }
    };
  });