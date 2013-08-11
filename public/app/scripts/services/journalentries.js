'use strict';

angular.module('nolla')
  .provider('journalentries', function () {
    console.log('journalentries service');

    this.$get = ['server', function (server) {
      return {
        getHelpers : function() {
          var model = server.getModel('journalhelpers');
          model.populate();
          return model;
        },
        fromClient: function (client) {
          var query = {
            client : client._id
          };
          var model = server.getModel('journalentries', query, {
            before: function (obj) {
          //    obj['date'] = moment(obj['date']).format('L');
            },
            after: function (obj) {
           //   console.log('after', obj['date']);
           //   obj['date'] = moment(obj['date'], moment().lang()._longDateFormat.L).format();
           //   console.log('after', obj['date']);
            }
          }).populate();
          model.schema = {};

          return model;
        }
      };
    }];

  });