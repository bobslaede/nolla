'use strict';

var nolla = angular.module('nolla', [
    'nolla.calendar',
    'ui.compat',
    'serviceUtilities',
    '$strap.directives',
    'nolla.config'
  ])
  .config(function ($stateProvider, $urlRouterProvider, configProvider) {

    var host = window.location.origin;
    if (window.location.protocol == 'chrome-extension:') {
      host = 'http://192.168.2.37:3003';
    }

    moment.lang('da');

    configProvider.host = host;

    $stateProvider
      .state('app', {
        abstract: true,
        url: '',
        templateUrl: 'views/index.html'
      })
      .state('app.login', {
        url: '/login',
        templateUrl: 'views/login.html'
      })
      .state('app.main', {
        url: '/nolla',
        abstract: true,
        resolve: {
          user: function (user, $q, $state) {
            var d = $q.defer();
            user.isAuthenticated()
              .then(function () {
                d.resolve(user);
              }, function (e) {
                d.reject(e);
                $state.transitionTo('app.login');
              });
            return d.promise;
          }
        },
        templateUrl: 'views/main.html'
      })
      .state('app.main.home', {
        url: '/nolla/home',
        templateUrl: 'views/home.html'
      })
      .state('app.main.client', {
        url: '/nolla/client/{clientId}',
        templateUrl: 'views/client.html'
      })
      .state('app.main.journal', {
        url: '/nolla/journal',
        templateUrl: 'views/journal.html'
      })
      .state('app.main.calendar', {
        url: '/nolla/calendar',
        templateUrl: 'views/calendar.html'
      })

  })
  .run(function ($rootScope, $state, $stateParams) {
    $rootScope.$state = $state;
    $rootScope.$stateParams = $stateParams;
    $state.transitionTo('app.main.home');
  });
