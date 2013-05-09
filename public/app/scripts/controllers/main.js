'use strict';

angular.module('nolla').controller('MainCtrl', function ($scope, $state, Clients, $stateParams) {

  console.log('MainCtrl');
  $scope.clients = Clients.getList();

  $scope.$state = $state;
  $scope.clientOrder = ['client.firstName', 'client.lastName'];
  $scope.model = {};
  $scope.$watch('$state.current.urlPath', function () {
    $scope.model.currentPath = $state.current.urlPath ? $state.current.urlPath : 'clients';
  });

  console.log($stateParams);

});