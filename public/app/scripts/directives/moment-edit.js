'use strict';

angular.module('nolla')
  .directive('momentEdit', function() {
    return {
      restrict: 'A',
      templateUrl: '/views/partials/moment-edit.html',
      replace: true,
      require: 'ngModel',
      scope: {
        moment: '=ngModel',
        show: '@momentEdit'
      },
      controller: function momentEditCtrl() {

      },
      compile: function momentEditCompile() {
        return {
          pre: function momentEditPreLink(scope, element, attrs, ngModel) {
            console.log(scope.show);
            scope.dateFormat = 'YYYY-MM-DD';
            scope.model = {};
            scope.model.date = scope.moment.format(scope.dateFormat);
            scope.model.time = scope.moment.format('HH:mm');

            scope.$watch('model.date', function () {
              if (!scope.model.date) {
                ngModel.$setValidity('no date', false);
                return;
              }
              ngModel.$setValidity('no date', true);
              ngModel.$setPristine();
              var m = moment(scope.model.date, scope.dateFormat);
              scope.moment.date(m.date());
              scope.moment.year(m.year());
              scope.moment.month(m.month());
              ngModel.$setViewValue(scope.moment);
              console.log(scope.moment.format());
            });

            scope.$watch('model.time', function () {
              if (!scope.model.time) {
                ngModel.$setValidity('no time', false);
                return;
              }
              ngModel.$setValidity('no time', true);
              ngModel.$setPristine();
              var m = moment(scope.model.time, 'HH:mm');
              scope.moment.hour(m.hour());
              scope.moment.minute(m.minute());
              ngModel.$setViewValue(scope.moment);
              console.log(scope.moment.format());
            })
          },
          post: function momentEditPostLink(scope, element, attrs) {
          }
        }
      }
    }
  });