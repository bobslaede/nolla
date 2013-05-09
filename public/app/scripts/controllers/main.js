'use strict';

angular.module('nolla').controller('MainCtrl', function ($scope, $state, Clients, $stateParams) {

  $scope.clients = Clients.getList();

  $scope.$state = $state;
  $scope.clientOrder = ['client.firstName', 'client.lastName'];
  $scope.model = {};
  $scope.$watch('$state.current.urlPath', function () {
    $scope.model.currentPath = $state.current.urlPath ? $state.current.urlPath : 'clients';
  });

  $scope.alerts = [];

  $scope.$on('saved', function () {
    $scope.alerts.pop();
    $scope.alerts.push({
      type : 'success',
      title : 'data saved',
      content : 'woo'
    });
  });

});