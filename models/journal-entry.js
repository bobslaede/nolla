'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var meta = require('./meta-schema');

var schema = new Schema({
  date: Date,
  entry: String,
  meta: [meta]
});

var model = mongoose.model('JournalEntry', schema);

module.exports = model;