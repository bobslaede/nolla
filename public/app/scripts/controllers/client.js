'use strict';

angular.module('nolla').controller('ClientCtrl', function ($scope, $stateParams, Restangular, $state) {
  if ($stateParams.clientId === '') {
    $state.transitionTo('app.home');
  }
  $scope.client = Restangular.one('clients', $stateParams.clientId).get();
  console.log('ClientCtrl');
});
