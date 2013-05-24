'use strict';

angular.module('nolla', ['ui.compat', 'restangular', '$strap.directives', 'goog'])
  .config(function ($routeProvider, $stateProvider, $urlRouterProvider, RestangularProvider, gapiProvider) {

    RestangularProvider.setBaseUrl('http://localhost\\:3003/api');
    RestangularProvider.setRestangularFields({
      id: '_id'
    });

    gapiProvider.setClientId('75672706662.apps.googleusercontent.com');
    gapiProvider.setKey('AIzaSyAq9qPcsZoBDXtFP-Zt1whLgMTD3ZUnqY8');
    gapiProvider.setScopes([
      'https://www.googleapis.com/auth/plus.login',
      'https://www.googleapis.com/auth/userinfo.profile',
      'https://www.googleapis.com/auth/userinfo.email'
    ]);


    $stateProvider
      .state('app', {
        url : '/',
        controller : 'AppCtrl',
        templateUrl : '/app/views/index.html'
      })
      .state('app.login', {
        url : 'login',
        controller : 'LoginCtrl',
        templateUrl : '/app/views/login.html'
      })
      .state('app.home', {
        url : 'app',
        resolve : {
          user : function (Auth) {
            return Auth.getAuth();
          }
        },
        controller : 'MainCtrl',
        templateUrl : '/app/views/main.html'
      })
      .state('app.home.client', {
        url : 'client/{clientId}',
        urlPath : 'client',
        controller: 'ClientCtrl',
        templateUrl : '/app/views/client.html'
      })
      .state('app.home.journals', {
        url : 'journals',
        urlPath : 'journals',
        template: 'journals'
      });

    /*
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
          'user' : function (User) {
            return User.getUser();
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
    */

  })
  .run(function ($rootScope, $state, $stateParams) {
    $state.transitionTo('app');
    $rootScope.$state = $state;
    $rootScope.$stateParams = $stateParams;
  });
