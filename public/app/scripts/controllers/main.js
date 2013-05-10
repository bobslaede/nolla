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

  var shiftAlerts = function () {

    $timeout(function () {
      $scope.alerts.shift();
    }, 3000);
  };

  $scope.$on('status', function (e, data) {
    $scope.alerts.push({
      type : data.type,
      title : '',
      content : data.msg
    });
    shiftAlerts();
  });

  /*

  $scope.$on('undo', function (msg) {
    console.log(arguments);
    $scope.alerts.push({
      type : 'success',
      title : 'Fortryd',
      content : ''
    });
    shiftAlerts();
  });

  $scope.$on('redo', function (msg) {
    console.log(arguments);
    $scope.alerts.push({
      type : 'success',
      title : 'Fortryd',
      content : ''
    });
    shiftAlerts();
  });

  */
});