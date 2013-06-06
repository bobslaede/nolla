'use strict';

angular.module('nolla')
  .controller('InitCtrl', ['$scope', 'auth', '$state', function ($scope, auth, $state) {
    console.log('InitCtrl');

    auth.getAuth()
      .then(function () {
        console.log('trans to app.main', $state.current, $state.params);
        var state = $state.current;
        if (state.name == 'app') {
          console.log('already here');
          state = 'app.main.client';
        }
        $state.transitionTo(state, $state.params);
      })

  }]);
