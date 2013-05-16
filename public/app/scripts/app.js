'use strict';

angular.module('nolla', ['ui.compat', 'restangular', '$strap.directives', 'hashKeyCopier'])
  .config(function ($routeProvider, $stateProvider, $urlRouterProvider, RestangularProvider) {

    RestangularProvider.setBaseUrl('/api');
    RestangularProvider.setRestangularFields({
      id: '_id'
    });

    $urlRouterProvider
      .otherwise('/');

    $stateProvider
      .state('login', {
        url : '/login',
        templateUrl : '/app/views/login.html',
        controller : 'LoginCtrl'
      })
      .state('logout', {
        url : '/logout',
        controller : 'LogoutCtrl'
      })
      .state('app', {
        abstract: true,
        resolve : {
          'user' : function (Restangular) {
            return Restangular.one('me', '').get();
          },
          'apps' : function (Restangular) {
            return Restangular.all('apps').getList();
          }
        },
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
