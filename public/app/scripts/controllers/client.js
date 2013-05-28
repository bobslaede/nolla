'use strict';

angular.module('nolla').controller('ClientCtrl', function ($scope, $stateParams, Restangular, $state, Clients) {
  console.log('ClientCtrl')

  if ($stateParams.clientId === '') {
    $state.transitionTo('app.home');
  }

  $scope.model = {};

  $scope.model.schema = Clients.getSchema();


  var client = Restangular.one('clients', $stateParams.clientId).get();

  client.then(function (clientData) {
    $scope.model.client = clientData;
  });

  $scope.saveClient = function () {
    console.log('save');
    $scope.model.client.put()
      .then(function (savedClient) {
        console.log('saved!');
        Clients.updateList(savedClient);
      });
  };

  /*

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
        $state.transitionTo('app.home.client', { clientId : newClient._id });
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
  */

  $scope.addContact = function (type) {
    $scope.model.client[type].push({
      type : '',
      contact : ''
    });
  };

  $scope.removeContact = function (type, index) {
    $scope.model.client[type].splice(index, 1);
  };

});
