'use strict';

angular.module('nolla')
  .controller('MainCtrl', ['$scope', '$state', 'clients', 'app', 'auth', function ($scope, $state, clients, app, auth) {

    document.addEventListener('keyup', function (e) {
      if (e.ctrlKey && e.which == 70) {
        e.preventDefault();
        $('.client-search').find('input').focus();
      }
    })

    clients.getAll();

    $scope.clients = clients;
    $scope.appModel = app.model;
    $scope.user = auth.user;

    $scope.selectAction = function (action) {
      var params = _.clone($state.params);
      $state.transitionTo(action, params);
    };

    $scope.selectClient = function (client) {
      var params = _.clone($state.params);
      params.clientId = client._id;
      var state = $state.current;
      $state.transitionTo(state, params);
    };

  }]);
