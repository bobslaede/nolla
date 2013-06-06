'use strict';

angular.module('nolla')
  .controller('MainCtrl', ['$scope', '$state', 'clients', 'app', 'auth', function ($scope, $state, clients, app, auth) {
    console.log('MainCtrl');


    $scope.clients = clients;
    $scope.appModel = app.model;
    $scope.user = auth.user;

    $scope.selectAction = function (action) {
      var params = _.clone($state.params);
      console.log('action', action, params);
      $state.transitionTo(action, params);
    };

    $scope.selectClient = function (client) {
      console.log('app.main.client', client._id);
      var params = _.clone($state.params);
      params.clientId = client._id;
      var state = $state.current;
      if (console.log(state)) {


      }
      $state.transitionTo(state, params);
    };

  }]);
