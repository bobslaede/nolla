'use strict';

angular.module('nolla').controller('MainCtrl', function ($scope, $state, Clients, $stateParams, $timeout, user, apps) {

  $scope.clients = Clients.getList();

  $scope.model = {};
  $scope.model.me = user;
  $scope.model.apps = apps;

  $scope.$state = $state;
  $scope.clientOrder = ['client.firstName', 'client.lastName'];

  $scope.$watch('$state.current.urlPath', function () {
    $scope.model.currentPath = $state.current.urlPath ? $state.current.urlPath : 'clients';
  });

  $scope.alerts = [];
  $scope.$on('saved', function (msg) {
    console.log(arguments);
    $scope.alerts.push({
      type : 'success',
      title : 'Data gemt',
      content : ''
    });
    $timeout(function () {
      $scope.alerts.shift();
    }, 3000);
  });

});