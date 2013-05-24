'use strict';

angular.module('nolla').controller('MainCtrl', function ($scope, $state, Clients, $stateParams, $timeout, user, Auth) {

  if (!user) {
    $state.transitionTo('login');
  }

  $scope.logout = function () {
    Auth.logout();
    $state.transitionTo('app.login');
  };

  $scope.chooseApp = function (appId) {
    alert(appId);
  };

  $scope.clients = Clients.getList();

  $scope.model = {};
  $scope.model.me = user;
  $scope.model.apps = user.apps;

  $scope.$state = $state;
  $scope.clientOrder = ['client.firstName', 'client.lastName'];

  $scope.$watch('$state.current.urlPath', function () {
    $scope.model.currentPath = $state.current.urlPath ? $state.current.urlPath : 'client';
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

});