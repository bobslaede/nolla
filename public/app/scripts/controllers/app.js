'use strict';

angular.module('nolla').controller('AppCtrl', function ($scope, $state, gapi, Auth, App) {
  console.log('AppCtrl');


  Auth.tryAuth()
    .then(function (response) {
      console.log(response);
      App.updateWindowTitle();
      if (!$state.current.urlPath) {
        console.log('no state!!!');
        $state.transitionTo('app.home');
      }
    }, function () {
      App.updateWindowTitle();
      console.log('auth rejected!')
      $state.transitionTo('app.login');
    });


});
