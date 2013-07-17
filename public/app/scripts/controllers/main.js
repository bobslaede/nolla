'use strict';

angular.module('nolla')
  .controller('MainCtrl', function ($scope, $state, clients, app, auth, storage) {

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

    $scope.clientListVisible = true;

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
      var state = $state.current;
      $state.transitionTo(state, params);
    };

  });
