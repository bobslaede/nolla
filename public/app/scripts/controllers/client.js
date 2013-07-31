'use strict';

angular.module('nolla')
  .controller('ClientCtrl', ['$scope', '$state', 'clients', function ($scope, $state, clients) {

    var id = $state.params.clientId;

    $scope.model = {};
    $scope.model.client = undefined;

    $scope.model.schema = {
      danmark : [
        'Gruppe 5',
        'Gruppe 1',
        'Gruppe 2',
        'Basis-Sygeforsikring'
      ],
      insurance : [
        'Gruppe 1',
        'Gruppe 2'
      ],
      contact : {
        phones:  [
          'Hjemme',
          'Arbejde',
          'Mobil'
        ],
        emails : [
          'Hjemme',
          'Arbejde'
        ]
      }
    };

    $scope.calendar = {};
    $scope.calendar.view = 'month';
    $scope.calendar.date = moment();

    $scope.locked = $scope.model.client === false;

    clients.findById(id)
      .then(function (client) {
        $scope.model.client = client;
        $scope.locked = client === false;
      }, function () {
        $scope.locked = true;
      });

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
      //$scope.model.client.$remove();
      clients.remove($scope.model.client)
        .then(function () {
          $state.transitionTo($state.current.name, {});
        }, function (err) {
          console.error('something went wrong when trying to delete client');
        });
    };

    $scope.addContact = function (type) {
      $scope.model.client[type].push({
        type: '',
        contact: ''
      });
      $scope.model.client.$wrap();
    };

    $scope.removeContact = function (type, contact) {
      var index = _.indexOf($scope.model.client[type], contact);
      if (index > -1) {
        $scope.model.client[type].splice(index, 1);
        $scope.model.client.$save();
      }
    };

  }]);
