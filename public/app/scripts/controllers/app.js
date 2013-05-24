'use strict';

angular.module('nolla').controller('AppCtrl', function ($scope, $state, gapi, Auth) {
  console.log('AppCtrl');

  Auth.tryAuth()
    .then(function (response) {
      console.log(response);
      $state.transitionTo('app.home');
    }, function () {
      console.log('auth rejected!')
      $state.transitionTo('app.login');
    });

});
