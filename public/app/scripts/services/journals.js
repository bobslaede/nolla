'use strict';

angular.module('nolla')
  .factory('Journals', function (Restangular, $q) {

    // Public API here
    var api = {
      getJournalFromClient : function (clientId) {
        return Restangular.one('clients', clientId).all('journalEntries').getList();
      },
      addJournalToClient : function (client, journal) {
        var d = $q.defer();
        return d.promise;
      },
      addJournalEntry : function (journal, journalsDeferred) {
        var d = $q.defer();
        journalsDeferred.then(function (journals) {
          journals.post(journal).then(function (response) {
            journalsDeferred.push(response);
            d.resolve(response);
          });
        });
        return d.promise;
      }
    };

    return api;
  });