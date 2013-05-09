'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

require('./journal-entry');
require('./app');
require('./user');

var meta = require('./meta-schema');

var contactInfo = new Schema({
  type: String,
  contact: String
});

var schema = new Schema({
  meta: meta,
  firstName: String,
  lastName: String,
  ssno: String,
  address: String,
  zip: String,
  city: String,
  phone: [contactInfo],
  email: [contactInfo],
  details: {
    danmark: String,
    insurance: String,
    municipality: String,
    reminder: Boolean,
    subsidy: Number,
    notes: String
  },
  journalEntries: [
    {
      type: Schema.Types.ObjectId,
      ref: 'JournalEntry'
    }
  ]
});

var model = mongoose.model('Client', schema);

module.exports = model;