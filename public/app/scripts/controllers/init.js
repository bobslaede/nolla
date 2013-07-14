'use strict';

angular.module('nolla')
  .controller('InitCtrl', ['$scope', 'auth', '$state', function ($scope, auth, $state) {
    console.log('InitCtrl');

    auth.getAuth()
      .then(function () {
        var state = $state.current;
        if (state.name == 'app') {
          state = 'app.main.client';
        }
        $state.transitionTo(state, $state.params);
      })

  }]);
