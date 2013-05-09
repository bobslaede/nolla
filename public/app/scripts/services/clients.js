'use strict';

angular.module('nolla')
  .factory('Clients', function (Restangular, $q, HashKeyCopier, $rootScope) {

    var rest = Restangular.all('clients');
    var clientsDeferred = rest.getList();

    // Public API here
    var api = {
      getList : function () {
        return clientsDeferred;
      },
      findById : function (id) {
        var d = $q.defer();

        clientsDeferred.then(function (clients) {
          var client = _.filter(clients, { _id : id });
          if (client.length === 1) {
            d.resolve(client.pop());
          } else {
            d.reject('no such client');
          }
        });

        return d.promise;
      },
      addClient : function (client) {
        clientsDeferred.then(function (clients) {
          clients.post(client).then(function (response) {
            clientsDeferred.push(response);
          });
        });
      },
      deleteClient : function (client) {
        var d = $q.defer();
        client.then(function (client) {
          var id = client._id;
          client.remove();
          api.getList()
            .then(function (clients) {
              var indexes = [];
              _.each(clients, function (c, i) {
                if (c._id === id) {
                  indexes.push(i);
                }
              });
              _.map(indexes, function (i) {
                clients.splice(i, 1);
              });
            });
          d.resolve();
        });
        return d.promise;
      }
    };

    return api;
  });