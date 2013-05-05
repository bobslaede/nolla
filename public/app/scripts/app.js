'use strict';

angular.module('nolla', ['ui.compat', 'restangular'])
  .config(['$routeProvider', '$stateProvider', '$urlRouterProvider', function ($routeProvider, $stateProvider, $urlRouterProvider) {

    $urlRouterProvider
      .otherwise('/');

    $stateProvider
      .state('clients', {
        url : '/',
        templateUrl : '/app/views/main.html'
      });

  }])
  .run(function ($rootScope, $state, $stateParams) {
    $rootScope.$state = $state;
    $rootScope.$stateParams = $stateParams;
  });
