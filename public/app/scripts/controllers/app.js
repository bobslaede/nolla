'use strict';

angular.module('nolla').controller('AppCtrl', function ($scope, auth, $state) {
  console.log('AppCtrl');
  auth.getToken()
    .then(function (token) {
      if (token) {

      }
    }, function () {
      console.log('trans to login');
      $state.transitionTo('login');
    });
});
