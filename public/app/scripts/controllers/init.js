'use strict';

angular.module('nolla')
  .controller('Init', function ($scope, $state, $log, user) {

    $log.info('Init controller started');

    user.isAuthenticated()
      .then(function () {
        $log.log('IS AUTHENTICATED!');
        $state.transitionTo('app.main');
      }, function () {
        $state.transitionTo('app.login');
      })


  });
