'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

require('./app');
require('./user');

var meta = require('./meta-schema');

var schema = new Schema({
  meta: meta,
  summary : { type: String, default: "" },
  start : { type: Date, default: Date.now() },
  end : { type: Date, default: Date.now() },
  calendar : {
    type : Schema.Types.ObjectId,
    ref : 'Calendar'
  },
  client : {
    type : Schema.Types.ObjectId,
    ref : 'Client'
  },
  allday : { type: Boolean, default: false },
  recurrence : [{ type: String, default: "" }]
});

schema.set('toJSON', { virtuals: true, getters: true })
schema.set('toObject', { virtuals: true, getters: true })

var model = mongoose.model('Event', schema);

module.exports = model;