'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var meta = require('./meta-schema');

require('./client');

var schema = new Schema({
  date: Date,
  entry: String,
  meta: meta,
  client : {
    type : Schema.Types.ObjectId,
    ref : 'Client'
  }
});

var model = mongoose.model('JournalEntry', schema);

module.exports = model;