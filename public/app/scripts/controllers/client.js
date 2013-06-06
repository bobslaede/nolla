'use strict';

angular.module('nolla')
  .controller('ClientCtrl', ['$scope', '$state', 'clients', function ($scope, $state, clients) {
    console.log('ClientCtrl');

    var id = $state.params.clientId;

    $scope.model = {};
    $scope.model.client = clients.findById(id);
    $scope.locked = $scope.model.client === false;

    $scope.newClient = function () {
      clients.add({})
        .then(function (addedClient) {
          var id = addedClient._id;
          var params = _.clone($state.params);
          params.clientId = id;
          $state.transitionTo($state.current.name, params);
        })
    };

    $scope.deleteClient = function () {
      console.warn('DELETE');
      //$scope.model.client.$remove();
      clients.remove($scope.model.client);
      $state.transitionTo($state.current.name, {});
    };

    $scope.addContact = function (type) {
      $scope.model.client[type].push({
        type: '',
        contact: ''
      });
      $scope.model.client.$rewrap();
    };

    $scope.removeContact = function (type, contact) {
      var index = _.indexOf($scope.model.client[type], contact);
      if (index > -1) {
        $scope.model.client[type].splice(index, 1);
        $scope.model.client.$save();
      }
    };

  }]);
