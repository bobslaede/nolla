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
          templateUrl: 'views/index.html'
        })
        .state('app.login', {
          url : '/login',
          templateUrl : 'views/login.html'
        })
        .state('app.main', {
          url : '/nolla',
          templateUrl : 'views/main.html'
        })
        .state('app.main.home', {
          url : '/nolla/home',
          templateUrl : 'views/home.html'
        })
        .state('app.main.client', {
          url : '/nolla/client',
          templateUrl : 'views/client.html'
        })
        .state('app.main.journal', {
          url : '/nolla/journal',
          templateUrl : 'views/journal.html'
        })
        .state('app.main.calendar', {
          url : '/nolla/calendar',
          templateUrl : 'views/calendar.html'
        })

    })
  .run(function ($rootScope, $state, $stateParams) {
    $rootScope.$state = $state;
    $rootScope.$stateParams = $stateParams;
    $state.transitionTo('app');
  });
