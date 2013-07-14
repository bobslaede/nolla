'use strict';

var nolla = angular.module('nolla', [
    'socket',
    'hashKeyCopier',
    'ui.compat',
    'goog',
    'auth',
    'serviceUtilities'
  ])
  .config([
    'socketProvider', '$stateProvider', '$urlRouterProvider', 'gapiProvider', 'authProvider',
    function (socketProvider, $stateProvider, $urlRouterProvider, gapiProvider, authProvider) {

      gapiProvider.setClientId('75672706662.apps.googleusercontent.com');
      gapiProvider.setKey('AIzaSyAq9qPcsZoBDXtFP-Zt1whLgMTD3ZUnqY8');
      gapiProvider.setScopes([
        'https://www.googleapis.com/auth/plus.login',
        'https://www.googleapis.com/auth/userinfo.profile',
        'https://www.googleapis.com/auth/userinfo.email'
      ]);

     // socketProvider.setServer('http://192.168.2.37:3003');
     // authProvider.setHost('http://192.168.2.37:3003');
      socketProvider.setServer(host);
      authProvider.setHost(host);

      moment.lang('da');

      $stateProvider
        .state('app', {
          url : '',
          resolve : {
            socketResolved : function (socket, $q) {
              console.log('resolving socket');
              var d = $q.defer();
              socket.socketPromise.then(function () {
                console.log('socket resolved');
                d.resolve();
              });
              return d.promise;
            }
          },
          controller: 'InitCtrl',
          templateUrl: 'views/index.html'
        })
        .state('app.main', {
          url : '/nolla',
          abstract: true,
          resolve : {
            user : function (auth, $state, $q) {
              var d = $q.defer();
              console.log('getting when authed');

              auth.getAuth()
                .then(function (user) {
                  d.resolve(user);
                }, function () {
                  $state.transitionTo('app');
                  d.reject();
                });

              return d.promise;
            }
          },
          controller: 'MainCtrl',
          templateUrl: 'views/main.html'
        })
        .state('app.main.client', {
          url : '/client/{clientId}',
          controller: 'ClientCtrl',
          templateUrl: 'views/client.html'
        })
        .state('app.main.journal', {
          url : '/journal/{clientId}',
          controller: 'JournalCtrl',
          templateUrl: 'views/journal.html'
        })
        .state('app.main.calendar', {
          url : '/calendar/{clientId}',
          controller: 'CalendarCtrl',
          templateUrl: 'views/calendar.html'
        })

    }])
  .run(function ($rootScope, $state, $stateParams) {
    $rootScope.$state = $state;
    $rootScope.$stateParams = $stateParams;
  });
