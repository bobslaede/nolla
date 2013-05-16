'use strict';

angular.module('nolla').controller('LogoutCtrl', function ($scope, auth, $http, $state) {

  console.log('LogoutCtrl');
  auth.getToken()
    .then(function (token) {
      var url = 'https://accounts.google.com/o/oauth2/revoke?callback=JSON_CALLBACK&token=';
      if (token && token['access_token']) {
        $http.jsonp(url + token['access_token'], {
          method : 'GET',
          contentType: 'application/json'
        })
          .done(function () {
            console.log('done');
            $state.transitionTo('login');
          });
      } else {
        $state.transitionTo('login');
      }
    }, function () {
      $state.transitionTo('login');
    });


});
