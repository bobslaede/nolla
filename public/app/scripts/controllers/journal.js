'use strict';

angular.module('nolla').controller('JournalCtrl', function ($scope, $stateParams, Restangular, $state, Journals, Clients) {

  if ($stateParams.clientId === '') {
    $state.transitionTo('app.home');
  }

  var client = Restangular.one('clients', $stateParams.clientId);
  var clientDeferred = client.get();
  var journals = client.all('journalentries');
  var journalsDeferred = journals.getList();

  $scope.addJournalEntry = function () {
    journals.post({});
  };

  $scope.model = {};

  clientDeferred
    .then(function (clientData) {
      $scope.model.client = clientData;
    });

  journalsDeferred
    .then(function (journalsData) {
      $scope.model.journals = journalsData;
    });

});
