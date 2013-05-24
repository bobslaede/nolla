'use strict';

angular.module('nolla')
  .factory('User', function ($q) {

    return {
      isSignedIn : function () {
        return false;
      }
    };

  });