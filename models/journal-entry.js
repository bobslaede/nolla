'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

require('./user');

var schema = new Schema({
  date: Date,
  entry: String,
  owner: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  }
});

var model = mongoose.model('JournalEntry', schema);

module.exports = model;