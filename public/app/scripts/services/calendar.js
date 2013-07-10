'use strict';

angular.module('nolla')
  .provider('calendar', function () {
    console.log('calendar service');

    this.$get = ['$serviceScope', function ($serviceScope) {

      var $scope = $serviceScope();


      return $scope;

    }];

  });