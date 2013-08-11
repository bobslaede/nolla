'use strict';

angular.module('nolla')
  .controller('Main', function ($scope, $state, storage, user, sync, $log) {

    $log.info('Main controller active');


    $scope.clients = sync('clients');
    $scope.clients.getAll();

    $scope.user = user.user;

    $scope.clientListVisible = true;
    $scope.clientId = $state.params.clientId;

    $scope.$on('$stateChangeSuccess', function () {
      $scope.clientId = $state.params.clientId;
    });

    $scope.$watch('clientListVisible', function () {
      var key = 'clientlist-visible-' + $state.current.name.replace(/\./g, '-');
      storage.set(key, $scope.clientListVisible);
    });

    $scope.$on('$stateChangeSuccess', function () {
      var key = 'clientlist-visible-' + $state.current.name.replace(/\./g, '-');
      storage.get(key, true)
        .then(function (value) {
          $scope.clientListVisible = value;
        });
    });

    $scope.selectAction = function (action) {
      var params = _.clone($state.params);
      $state.transitionTo(action, params);
    };

    $scope.selectClient = function (client) {
      var params = _.clone($state.params);
      params.clientId = client._id;
      $scope.clientId = client._id;
      var state = $state.current;
      if (state.name == 'app.main.home') {
        state = 'app.main.client';
      }
      $state.transitionTo(state, params);
    };

  });
