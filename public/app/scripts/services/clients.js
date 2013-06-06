'use strict';

angular.module('nolla')
  .provider('clients', function () {
    console.log('clients service');

    this.$get = ['server', function (server) {
      var model = server.getModel('clients').populate();
      model.schema = {};
      return model;
    }];

  });