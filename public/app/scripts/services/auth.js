'use strict';

angular.module('nolla')
  .service('auth', function (gapi, chrome, $q, $http) {

    this.getToken = function () {
      var d = $q.defer();
      if (typeof chrome.experimental !== 'undefined' && typeof chrome.experimental.identity.getAuthToken !== 'undefined') {
        //TODO: Implement as Packaged App
        chrome.experimental.identity.getAuthToken({}, function (token) {
          if (token !== null) {
            d.resolve(token);
          } else {
            d.reject();
          }
        });
      } else {
        gapi.auth.init(function () {
          console.log('get token', gapi.auth.getToken());
          var token = gapi.auth.getToken();
          if (token !== null) {
            d.resolve(token);
          } else {
            d.reject();
          }
        });
      }
      return d.promise;
    };

  });