'use strict';

var nolla = angular.module('nolla', [
    'ui.compat',
    'serviceUtilities'
  ])
  .config(function ($stateProvider, $urlRouterProvider) {

      var host = window.location.origin;
      if (window.location.protocol == 'chrome-extension:') {
        host = 'http://192.168.2.37:3003';
      }

      moment.lang('da');

      $stateProvider
        .state('app', {
          url : '',
          controller: 'InitCtrl',
          templateUrl: 'views/index.html'
        })

    })
  .run(function ($rootScope, $state, $stateParams) {
    $rootScope.$state = $state;
    $rootScope.$stateParams = $stateParams;
    $state.transitionTo('app');
  });
