'use strict';

angular.module('nolla')
  .service('Auth', function ($http, $q, $rootScope, gapi, $log, $state) {

    this.isAuthed = false;
    this.user = undefined;
    this.token = undefined;

    this.askForAuthentication = function (options) {
      options = _.extend({
        silent: false
      }, options || {})
      var d = $q.defer();
      if (window.chrome && window.chrome.experimental && window.chrome.experimental.identity) {
        $log.debug('We are in a packaged app, options:', options);
        chrome.experimental.identity.getAuthToken({
            interactive: !options.silent
          }, function (accessToken) {
            $log.info('chrome responded with', accessToken);
            if (accessToken !== undefined) {
              var response = {
                'access_token' : accessToken,
                'client_id' : '75672706662.apps.googleusercontent.com',
                'token_type' : 'Bearer'
              };
              d.resolve(response);
              $rootScope.$digest();
            } else {
              d.reject();
              $rootScope.$digest();
            }
          });
      } else {
        $log.debug('this is a website, trying to authenticate with gapi, options:', options);
        gapi.load()
          .then(function () {
            var d = $q.defer();
            $log.info('gapi has loaded');
            gapi.auth({
              silent: !!options.silent
            }).then(function (response) {
                $log.info('gapi auth resolved', arguments);
                d.resolve(response);
              }, function () {
                $log.info('gapi auth rejected');
                d.reject();
              });
            return d.promise;
          })
          .then(function (response) {
            $log.info('gapi responded with', response);
            if (response && !response.error) {
              d.resolve(response);
            } else {
              d.reject(response && response.error);
            }
          });
      }
      return d.promise;
    };

    this.tryAuth = function () {
      $log.info('trying to auth without asking the user');
      var self = this;
      var d = $q.defer();
      this.getAuth()
        .then(function (user) {
          d.resolve(user);
        }, function () {
          $log.info('wasn\'t authed, trying silent auth');
          self.askForAuthentication({
            silent: true
          })
            .then(function (token) {
              $log.info('silent auth came thru, asking the server to verify');
              d.resolve(self.authWithServer(token));
            }, function () {
              $log.info('silent auth didn\'t work, user is not authed');
              d.reject();
            });
        });
      return d.promise;
    };

    this.getAuth = function () {
      var d = $q.defer();
      var self = this;
      if (this.isAuthed) {
        d.resolve(this.user);
      } else {
        $http.get('http://localhost:3003/api/auth')
          .success(function (user) {
            self.isAuthed = true;
            self.user = user;
            d.resolve(user);
          })
          .error(function () {
            self.user = undefined;
            self.isAuthed = false;
            d.reject();
          });
      }
      return d.promise;
    };

    this.logout = function () {
      this.isAuthed = false;
      this.user = undefined;
      $http.get('/api/logout');
      return;
    };

    this.authWithServer = function (token) {
      var self = this;
      var d = $q.defer();
      $http.post('http://localhost:3003/api/auth', token)
        .success(function (user) {
          self.isAuthed = true;
          self.user = user;
          self.token = token;
          d.resolve(user);
        })
        .error(function () {
          self.user = undefined;
          self.isAuthed = false;
          self.token = undefined;
          d.reject();
        });
      return d.promise;
    };

  });