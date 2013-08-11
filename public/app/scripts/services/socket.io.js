'use strict';

angular.module('nolla')
  .provider('socket', function () {

    var server;
    this.setServer = function (value) {
      server = value;
    };

    this.$get = function ($window, $rootScope, $q, $log, config) {
      var io = $window.io;


      var d = $q.defer();
      var socket = io.connect(config.host);
      $window.socket = socket;

      socket.on('connect', function () {
        $log.info('socket is connected');
        $rootScope.$apply(function () {
          d.resolve();
        });
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


    };

  });