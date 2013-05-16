'use strict';

angular.module('nolla').controller('LoginCtrl', function ($scope, gapi, $state) {

  $scope.signin = function () {
    var token = gapi.auth.getToken();
    if (token['access_token']) {
      $state.transitionTo('app.home');
    }
  };

});
