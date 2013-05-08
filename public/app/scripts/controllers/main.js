'use strict';

angular.module('nolla').controller('MainCtrl', function ($scope, $state, Restangular, $stateParams) {

  console.log('MainCtrl');
  $scope.clients = Restangular.all('clients').getList();

  $scope.$state = $state;
  $scope.model = {};
  $scope.$watch('$state.current.urlPath', function () {
    $scope.model.currentPath = $state.current.urlPath ? $state.current.urlPath : 'clients';
  });

  console.log($stateParams);

});