'use strict';

angular.module('nolla', ['ui.compat', 'restangular'])
  .config(function ($routeProvider, $stateProvider, $urlRouterProvider, RestangularProvider) {

    RestangularProvider.setBaseUrl('/api');
    RestangularProvider.setRestangularFields({
      id: '_id'
    });

    $stateProvider
      .state('app', {
        abstract: true,
        templateUrl : '/app/views/index.html',
        controller : 'MainCtrl'
      })
      .state('app.home', {
        url : '/',
        urlPath : '',
        templateUrl : '/app/views/home.html',
        controller : 'HomeCtrl'
      })
      .state('app.clients', {
        url : '/clients/{clientId}',
        urlPath : 'clients',
        templateUrl : '/app/views/client.html',
        controller : 'ClientCtrl'
      })
      .state('app.journals', {
        url : '/journals/{clientId}',
        urlPath : 'journals',
        template : '<p>journals</p>'
      });

  })
  .run(function ($rootScope, $state, $stateParams) {
    $rootScope.$state = $state;
    $rootScope.$stateParams = $stateParams;
  });
