'use strict';

angular.module('nolla')
  .provider('clients', function () {
    console.log('clients service');

    this.$get = ['sync', function (sync) {
      console.log('new clients');
      return sync('clients');
    }];

  });