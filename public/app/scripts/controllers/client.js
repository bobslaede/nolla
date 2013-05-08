'use strict';

angular.module('nolla').controller('ClientCtrl', function ($scope, $stateParams, Restangular, $state, client) {
  if ($stateParams.clientId === '') {
    $state.transitionTo('app.home');
  }
  $scope.client = client;
  console.log('ClientCtrl');
});
