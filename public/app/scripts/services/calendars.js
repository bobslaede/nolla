'use strict';

angular.module('nolla')
  .provider('calendars', function () {
    console.log('calendars service');

    this.$get = ['sync', function (sync) {
      console.log('new calendars');
      return sync('calendars');
    }];

  });