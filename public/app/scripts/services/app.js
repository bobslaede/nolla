'use strict';

angular.module('nolla')
  .service('App', function ($q, $http, Auth, $state, $window) {


    this.getActiveApp = function () {
      var d = $q.defer();
      $http.get('http://localhost:3003/api/activeApp')
        .success(function (app) {
          d.resolve(app);
        })
        .error(function () {
          d.reject();
        });
      return d.promise;
    };

    this.setActiveApp = function () {
      var d = $q.defer();
      d.resolve();
      return d.promise;
    };

    this.updateWindowTitle = function () {
      this.getActiveApp()
        .then(function (app) {
          $window.document.title = (app.name + ' - ' + 'nolla');
        }, function () {
          $window.document.title = ('nolla');
        });
    };

  });