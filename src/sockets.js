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
var JournalHelper = require('../models/journal-helper');
var SocketModel = require('./socket-model');

module.exports = function (io, sessionSockets) {


  var broadcast = function(room, event, data) {
    io.sockets.in(room).emit(event, data);
  };

  sessionSockets.on('connection', function (err, socket, session) {
    console.log(session);

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

          var options = {
            saveQuery : {
              meta : {
                app : function () {
                  return room;
                },
                owner : session.userId,
                'createdAt' : function () {
                  return Date.now();
                }
              }
            },
            getQuery : {
              'meta.app' : function () {
                return room;
              }
            }
          };

          var clients = new SocketModel(socket, ClientModel, options);
          clients.on('broadcast', function (evt, data) {
            console.log('broadcast', evt, room);
            broadcast(room, evt, {
              origin: socket.id,
              data : data
            });
          });

          var journals = new SocketModel(socket, JournalEntryModel, options);
          journals.on('broadcast', function (evt, data) {
            console.log('broadcast', evt, room);
            broadcast(room, evt, {
              origin: socket.id,
              data : data
            });
          });

          var journalHelpers = new SocketModel(socket, JournalHelper, options);
          journalHelpers.on('broadcast', function (evt, data) {
            console.log('broadcast', evt, room);
            broadcast(room, evt, {
              origin: socket.id,
              data : data
            });
          });

        })



    } else {
      socket.emit('error', { msg: 'not authed' });
    }

  });

};