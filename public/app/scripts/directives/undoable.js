'use strict';

angular.module('nolla')
  .directive('nlUndoable', function () {
    return {
      restrict: 'A',
      controller : function ($scope) {

        var _undo = [];
        var _redo = [];

        var pushState = _.debounce(function () {
          var state = JSON.stringify($scope.model.client);
          _undo.push(state);
          console.log('undo', _undo);
        }, 500, true);

        var undo = function () {
          var state = _undo.pop();
          if (state) {
            _redo.push(JSON.stringify($scope.model.client));
            state = JSON.parse(state);
            $.extend($scope.model.client, state);
            $scope.$emit('undo', 'success');
          } else {
            //$scope.$emit('undo', 'nothing to undo');
          }
        };

        var redo = function () {
          var state = _redo.shift();
          if (state) {
            _undo.push(JSON.stringify($scope.model.client));
            state = JSON.parse(state);
            $.extend($scope.model.client, state);
            $scope.$emit('redo', 'success');
          } else {
            //$scope.$emit('redo', 'nothing to undo');
          }
        };

        $scope.pushState = pushState;
        $scope.undo = undo;
        $scope.redo = redo;

      },
      link: function postLink(scope, element) {
        element.on('keydown', 'input,select,textarea', function () {
          scope.pushState();
        });
      }
    };
  });