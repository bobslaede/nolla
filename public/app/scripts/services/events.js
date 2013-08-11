'use strict';

angular.module('nolla')
  .provider('events', function () {
    console.log('events service');

    this.$get = ['sync', function (sync) {
      console.log('new events');
      return sync('events');
    }];

  });