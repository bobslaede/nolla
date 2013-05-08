'use strict';

angular.module('nolla', ['ui.compat', 'restangular'])
  .config(function ($routeProvider, $stateProvider, $urlRouterProvider, RestangularProvider) {

    RestangularProvider.setBaseUrl('/api');
    RestangularProvider.setRestangularFields({
      id: '_id'
    });

    $urlRouterProvider
      .otherwise('/');

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
        resolve : {
          client : function(Restangular, $stateParams) {
            return Restangular.one('clients', $stateParams.clientId).get()
          }
        },
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
