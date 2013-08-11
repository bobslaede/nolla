(function (angular) {
  'use strict';

  angular.module('auth', [])
    .provider('auth', function () {

      var host = '';
      this.setHost = function (value) {
        host = value;
      };

      this.$get = ['$http', '$q', '$rootScope', 'gapi', function ($http, $q, $rootScope, gapi) {
        var self = this;

        this.isAuthed = false;
        this.user = undefined;
        this.token = undefined;

        var authWithChromeIdentity = function (options) {
          var d = $q.defer();
          console.debug('We are in a packaged app, options:', options);
          chrome.experimental.identity.getAuthToken({
            interactive: !options.silent
          }, function (accessToken) {
            console.info('chrome responded with', accessToken);
            if (accessToken !== undefined) {
              var response = {
                'access_token' : accessToken
              };
              d.resolve(response);
              $rootScope.$digest();
            } else {
              d.reject();
              $rootScope.$digest();
            }
          });
          return d.promise;
        };

        var authWithGapi = function (options) {
          var d = $q.defer();
          console.debug('this is a website, trying to authenticate with gapi, options:', options);
          gapi.load()
            .then(function () {
              console.info('gapi has loaded');
              gapi.auth({
                silent: !!options.silent
              }).then(function (response) {
                  console.info('gapi auth resolved', response);
                  if (response && !response.error) {
                    d.resolve(response);
                  } else {
                    d.reject(response && response.error);
                  }
                }, function () {
                  console.info('gapi auth rejected');
                  d.reject();
                });
            });
          return d.promise;
        }

        this.askForAuthentication = function (options) {
          options = _.extend({
            silent: false
          }, options || {})

          if (window.chrome && window.chrome.experimental && window.chrome.experimental.identity) {
            return authWithChromeIdentity(options);
          } else {
            return authWithGapi(options);
          }
        };

        this.tryAuth = function () {
          var d = $q.defer();
          console.info('trying to auth without asking the user');
          self.askForAuthentication({
            silent: true
          })
            .then(function (token) {
              console.log('got token without asking!')
              d.resolve(token);
            }, function () {
              console.log('didnt get token, will ask the user now')
              self.askForAuthentication({
                silent: false
              })
                .then(function (token) {
                  console.log('got token when asked')
                  d.resolve(token);
                }, function () {
                  console.log('didnt get token even tho i asked')
                  d.reject();
                })
            })

          return d.promise;
        };

        this.validateWithServer = function (token) {
          var d = $q.defer();
          $http.post(host + '/auth', token)
            .success(function (response) {
              if (response && response._id) {
                d.resolve(response);
              } else {
                d.reject();
              }
            }, function (err) {
              d.reject(err);
            })
          return d.promise;
        };

        this.auth = function () {
          console.log('trying to auth');
          var d = $q.defer();
          self.tryAuth()
            .then(self.validateWithServer)
            .then(function (user) {
              self.user = user;
              d.resolve();
            })
          return d.promise;
        }

        var authedDeferred = $q.defer();
        this.getAuth = function () {
          if (self.user) {
            authedDeferred.resolve(self.user);
          } else {
            $http.get(host + '/auth' + '?' + Math.random())
              .success(function (response) {
                if (response && response._id) {
                  console.log('i am logged in', response);
                  self.user = response;
                  authedDeferred.resolve();
                } else {
                  console.log('i am not logged in');
                  authedDeferred.resolve(self.auth());
                }
              })
              .error(authedDeferred.reject);
          }
          return authedDeferred.promise;
        };

        this.whenAuthed = function () {
          return authedDeferred.promise;
        };

        return this;
      }]

      return this;

    });

}(angular));