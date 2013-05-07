'use strict';

angular.module('nolla').controller('MainCtrl', function ($scope, $state, Restangular, $stateParams) {

  console.log('MainCtrl');
  $scope.clients = Restangular.all('clients').getList();

  $scope.$state = $state;
  $scope.currentPath = $state.current.urlPath ? $state.current.urlPath : 'clients';

  console.log($stateParams);

});