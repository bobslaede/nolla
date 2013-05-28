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

    $urlRouterProvider
      .otherwise('/app');

    $stateProvider
      .state('app', {
        url : '',
        controller : 'AppCtrl',
        templateUrl : '/app/views/index.html'
      })
      .state('app.login', {
        url : '/login',
        controller : 'LoginCtrl',
        templateUrl : '/app/views/login.html'
      })
      .state('app.home', {
        url : '/app',
        resolve : {
          user : function (Auth) {
            return Auth.getAuth();
          }
        },
        controller : 'MainCtrl',
        templateUrl : '/app/views/main.html'
      })
      .state('app.home.client', {
        url : '/client/{clientId}',
        urlPath : 'client',
        controller: 'ClientCtrl',
        templateUrl : '/app/views/client.html'
      })
      .state('app.home.journal', {
        url : '/journal/{clientId}',
        urlPath : 'journal',
        controller: 'JournalCtrl',
        templateUrl : '/app/views/journal.html'
      });


  })
  .run(function ($rootScope, $state, $stateParams) {
 //   $state.transitionTo('app');
    $rootScope.$state = $state;
    $rootScope.$stateParams = $stateParams;
  });
