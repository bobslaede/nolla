'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var meta = require('./meta-schema');

require('./client');

var schema = new Schema({
  date: { type: Date, default: Date.now() },
  entry: { type: String, default: '' },
  entryData : [
    {
      origin: { type: Schema.Types.ObjectId },
      name: { type: String, default : '' },
      description : { type: String, default: '' },
      originaldescription : { type: String, default: '' }
    }
  ],
  locked: { type: Boolean, default: false },
  meta: meta,
  client : {
    type : Schema.Types.ObjectId,
    ref : 'Client'
  }
});

var model = mongoose.model('JournalEntry', schema);

module.exports = model;