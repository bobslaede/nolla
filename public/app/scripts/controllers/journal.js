'use strict';

angular.module('nolla')
  .controller('JournalCtrl', ['$scope', '$state', 'clients', 'journalentries', function ($scope, $state, clients, journalentries) {
    console.log('JournalCtrl');

    var id = $state.params.clientId;


    $scope.model = {};
    $scope.model.client = clients.findById(id);
    $scope.locked = $scope.model.client === false;

    if ($scope.model.client) {

      $scope.model.journal = journalentries.fromClient($scope.model.client);

      $scope.model.helpers = journalentries.getHelpers();

      $scope.addJournalHelper = function () {
        $scope.model.helpers.add({
          name : 'foo ' + Math.random()
        });
      };

      $scope.removeJournalHelper = function (helper) {
        $scope.model.helpers.remove(helper);
      }

      $scope.addJournalEntry = function () {
        _.each($scope.model.journal.list, function (obj) {
          obj.locked = true;
        });
        $scope.model.journal.add({
          client: $scope.model.client._id,
          date : Date.now()
        });
      };

      $scope.removeJournalEntry = function (entry) {
        $scope.model.journal.remove(entry);
      };

      $scope.removeJournalEntryData = function (data, entry) {
        var index = entry.entryData.indexOf(data);
        if (index > -1) {
          entry.entryData.splice(index, 1);
        }
      }

    }
  }]);
