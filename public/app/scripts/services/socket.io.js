'use strict';

angular.module('socket', [])
  .provider('socket', function () {
    console.log('socket provider');

    var server;
    this.setServer = function (value) {
      server = value;
    };

    this.$get = ['$window', '$rootScope', '$q', function ($window, $rootScope, $q) {
      var io = $window.io;


      var d = $q.defer();
      var socket = io.connect(server);
      $window.socket = socket;

      socket.on('connect', function () {
        d.resolve();
      });

      return {
        on : function (event, cb) {
          socket.on(event, function () {
            var args = arguments;
            $rootScope.$apply(function () {
              cb.apply(socket, args);
            });
          });
        },

        emit : function (event, data, cb) {
          cb = cb || function () {};
          socket.emit(event, data, function () {
            var args = arguments;
            $rootScope.$apply(function () {
              cb.apply(socket, args);
            });
          });
        },

        socket: socket,
        socketPromise : d.promise
      };


    }];

  });