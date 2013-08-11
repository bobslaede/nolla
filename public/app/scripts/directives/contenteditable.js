angular.module('nolla')
  .directive('contenteditable', function () {
    return {
      require: 'ngModel',
      link: function (scope, element, attrs, ctrl) {

        // view -> model
        element.on('input', function () {
          scope.$apply(function () {
            ctrl.$setViewValue(element.html());
          });
        });

        // model -> view
        ctrl.$render = function () {
          element.html(ctrl.$viewValue);
        };

      }
    };
  });
