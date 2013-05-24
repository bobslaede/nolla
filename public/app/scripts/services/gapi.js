'use strict';

angular.module('goog', [])
  .provider('gapi', function () {

    var clientId = '';
    this.setClientId = function (value) {
      clientId = value;
    };

    var key = '';
    this.setKey = function (value) {
      key = value;
    };

    var scopes = [];
    this.setScopes = function (value) {
      scopes = value;
    };

    var immediate = true;
    this.setImmediate = function (value) {
      immediate = !!value;
    };

    var responseType = 'token';
    this.setResponseType = function (value) {
      responseType = value;
    };

    var url = 'https://apis.google.com/js/client:plusone.js';
    this.setUrl = function (value) {
      url = value;
    };

    var accessType = 'online';
    this.setAccessType = function (value) {
      accessType = value;
    };

    var redirectUri = '';
    this.setRedirectUri = function (value) {
      redirectUri = value;
    };

    var onloadName = 'angularCallbackGapiOnload';
    var gapi;



    this.$get = function ($q, $http, $rootScope, $log) {
      var loadedDeferred = $q.defer();
      var authorizedDeferred = $q.defer();

      this.load = function () {
        window[onloadName] = angular.bind(this, function () {
          gapi = window['gapi'];
          $log.info('gapi onload callback fired');
          loadedDeferred.resolve(gapi);
          $rootScope.$digest();
        });

        $http.jsonp(url + '?onload=' + onloadName);

        return loadedDeferred.promise;
      };

      loadedDeferred.promise.then(function () {
        gapi.client.setApiKey(key);
      });

      this.auth = function (options) {
        options = _.extend({
          silent : false
        }, options || {});
        $log.debug('gapi auth options', options);
        var authCallback = function (response) {
          $log.debug('gapi auth callback', response);
          if (!response || response.error) {
            $log.warn('Not authorized', response && response.error);
            authorizedDeferred.reject(response);
          } else {
            $log.info('Authorized');
            authorizedDeferred.resolve(response);
          }
          $rootScope.$digest();
        };

        var auth = function () {
          _.defer(function () {
            gapi.auth.authorize({
              'client_id' : clientId,
              'scope' : scopes,
              'immediate' : !!options.silent,
           //   'prompt' : (!!options.silent ? '' : 'consent'), // DEBUG
              'access_type' : accessType
            }, authCallback);
          });
        };

        loadedDeferred.promise.then(function () {
          _.defer(auth);
        });

        return authorizedDeferred.promise;
      };

      this.gPlusSignin = function (elem, cb) {
        loadedDeferred.promise.then(function () {
          $log.log(elem);
          gapi.signin.render(elem, {
            'clientid' : clientId,
            'cookiepolicy': 'single_host_origin',
            'scope': scopes.join(' '),
            'accesstype': accessType,
            'redirecturi' : redirectUri,
            'approval_prompt' : 'force',
            callback : function (response) {
              $log.info('Response from google signin callback', response);
              cb(response);
              $rootScope.$digest();
            }
          });
        });
      };

      return this;
    };

  });