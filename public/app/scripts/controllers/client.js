'use strict';

angular.module('nolla').controller('ClientCtrl', function ($scope, $stateParams, Restangular, $state, Clients) {
  if ($stateParams.clientId === '') {
    $state.transitionTo('app.home');
  }

  $scope.model = {};

  var client = Clients.findById($stateParams.clientId);
  client.then(function (client) {
    $scope.model.client = client;
  }, function (err) {
    console.warn(err);
    $state.transitionTo('app.home');
  });

  $scope.addClient = function () {
    var c = {
      firstName : 'Test ' + Math.random()
    };
    Clients.addClient(c);
  };
  $scope.saveClient = function () {
    $scope.model.client.put();
  };
  $scope.delClient = function () {
    Clients.deleteClient(client)
      .then(function () {
        $state.transitionTo('app.home');
      });
  };
});
