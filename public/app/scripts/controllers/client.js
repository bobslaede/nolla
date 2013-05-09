'use strict';

angular.module('nolla').controller('ClientCtrl', function ($scope, $stateParams, Restangular, $state, Clients) {
  if ($stateParams.clientId === '') {
    $state.transitionTo('app.home');
  }

  $scope.actions = [
    {
      'text' : 'Slet'
    }
  ];

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
      firstName : 'Fornavn',
      lastName : 'Efternavn'
    };
    Clients.addClient(c)
      .then(function (newClient) {
        $state.transitionTo('app.clients', { clientId : newClient._id });
      });
  };

  $scope.saveClient = function () {
    $scope.model.client.put();
    $scope.$emit('saved');
  };

  $scope.modals = {};
  $scope.modals.delete = {
    content : 'Vil du slette denne klient? Det kan ikke fortrydes',
    header : 'Vil du slette denne klient?',
    action : function () {
      Clients.deleteClient(client)
        .then(function () {
          $state.transitionTo('app.home');
        });
    }
  };


});
