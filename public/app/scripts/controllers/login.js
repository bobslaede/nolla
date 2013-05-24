'use strict';

angular.module('nolla').controller('LoginCtrl', function ($scope, $state, Auth) {
  console.log('LoginCtrl');

  /*
  $scope.$on('gplus-sign-in', function (e, response) {
    Auth.authWithServer(response)
      .then(function (serverResponse) {
        $state.transitionTo('app.home');
      });
  });
  */

  $scope.login = function () {
    Auth.askForAuthentication()
      .then(function (response) {
        console.log('google response', response);
        return Auth.authWithServer(response);
      })
      .then(function (response) {
        console.log('server response', response);
        $state.transitionTo('app.home');
      });
  };

});
