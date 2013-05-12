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

  $scope.model.details = {};
  $scope.model.details.danmark = [
    'Gruppe 5',
    'Gruppe 1',
    'Gruppe 2',
    'Basis-Sygeforsikring'
  ];
  $scope.model.details.insurance = [
    'Gruppe 1',
    'Gruppe 2'
  ];

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
        $scope.$emit('status', {
          type: 'success',
          msg : 'Ny klient er blevet tilføjet'
        });
        $state.transitionTo('app.clients', { clientId : newClient._id });
      });
  };

  $scope.saveClient = function () {
    $scope.model.client.put();
    $scope.$emit('status', {
      type: 'success',
      msg : $scope.model.client.firstName + ' er blevet gemt :)'
    });
  };

  $scope.modals = {};
  $scope.modals.delete = {
    content : 'Vil du slette denne klient? Det kan ikke fortrydes',
    header : 'Vil du slette denne klient?',
    action : function () {
      var name = $scope.model.client.firstName;
      Clients.deleteClient(client)
        .then(function () {
          $state.transitionTo('app.home');
          $scope.$emit('status', {
            type: 'success',
            msg : name + ' er blevet slettet'
          });
        });
    }
  };

  $scope.addContact = function (type) {
    $scope.pushState();
    $scope.model.client[type].push({
      type : '',
      contact : ''
    });
  };

  $scope.removeContact = function (type, index) {
    $scope.pushState();
    $scope.model.client[type].splice(index, 1);
    $scope.saveClient();
  };

  $scope.$on('undo', function () {
    $scope.saveClient();
  });

  $scope.$on('redo', function () {
    $scope.saveClient();
  });

});
