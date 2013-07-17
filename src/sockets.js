'use strict';

var mongoose = require('mongoose');
var when = require('when');
var _ = require('underscore');

var db = mongoose.connection;
var dbDeferred = when.defer();
db.on('error', function(err) {
  console.warn('database error: %s', err);
  dbDeferred.reject(err);
});
db.once('open', function() {
  console.info('database is connected');
  dbDeferred.resolve();
});

var UserModel = require('../models/user');
var ClientModel = require('../models/client');
var JournalEntryModel = require('../models/journal-entry');
var CalendarModel = require('../models/calendar');
var EventModel = require('../models/event');
var JournalHelper = require('../models/journal-helper');

var findModelFromCollection = function (collection) {
  var model = _.filter(mongoose.models, function (m) {
    return m.collection.name === collection;
  });
  if (model.length === 1) {
    return model[0];
  }
  return false;
};

module.exports = function (io, sessionSockets) {


  var broadcast = function(room, type, model, data, origin) {
    io.sockets.in(room).emit('msg', {
      type : type,
      model : model,
      data : data,
      origin: origin
    });;
  };

  sessionSockets.on('connection', function (err, socket, session) {

    if (session && session.userId) {

      UserModel.findById(session.userId)
        .populate('apps')
        .exec(function (err, user) {

          var room = user.apps[0]._id;
          var selectRoom = function (roomName) {
            room = roomName;
            socket.leave(room);
            console.log('selecting room', room);
            socket.join(roomName);
            session.appId = room;
            session.save();
          };

          if (session.appId) {
            selectRoom(session.appId);
          } else {
            selectRoom(user.apps[0]._id);
          }

          socket.emit('apps:list', user.apps);
          socket.on('apps:select', function (app) {
            selectRoom(app._id);
          });

          socket.on('msg', function (msg, ack) {
            var type = msg.type;
            var collection = msg.model;
            var data = msg.data;
            var Model = findModelFromCollection(collection);
            if (Model) {
              var findQuery = {
                'meta.app' : room
              };
              switch (type) {
                case 'get':
                  Model.find(findQuery)
                    .exec(function (err, data) {
                      if (err) {

                      } else {
                        ack(data);
                      }
                    });
                  break;
                case 'delete':
                  var deleteQuery = _.extend({}, findQuery, {
                    _id : data._id
                  });
                  Model.findOneAndRemove(deleteQuery)
                    .exec(function (err) {
                      if (err) {
                        // TODO: handle delete error
                        ack(false);
                      } else {
                        ack(true);
                        broadcast(room, 'delete', collection, data, socket.id);
                      }
                    });
                  break;
                case 'update':
                  var updateQuery = _.extend({}, findQuery, {
                    _id : data._id
                  });
                  var updateData = _.clone(data);
                  // do not update these fields, they cannot be changed
                  delete updateData._id;
                  delete updateData.__v;
                  delete updateData.meta;

                  var update = {
                    '$set' : updateData
                  };
                  Model.update(updateQuery, update)
                    .exec(function (err) {
                      if (err) {

                      } else {
                        Model.findOne(updateQuery)
                          .exec(function (err, response) {
                            console.log('updating stuff', collection);
                            ack(response);
                            broadcast(room, 'update', collection, response, socket.id);
                          });
                      }
                    });

                  break;
                case 'add':
                  var data = _.extend({}, data, {
                    meta : {
                      app : room,
                      owner : session.userId,
                      createdAt : Date.now()
                    }
                  });
                  console.log('new ', collection, data)
                  var model = new Model(data);
                  model.save(function (err, response) {
                    if (err) {

                    } else {
                      ack(model);
                      broadcast(room, 'add', collection, model, socket.id);
                    }
                  });
                  break;
              }
            } else {
              //TODO: Error reporting here
            }
          });

        })



    } else {
      socket.emit('error', { msg: 'not authed' });
    }

  });

};