'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

require('./journal-entry');
require('./app');
require('./user');

var meta = require('./meta-schema');

var contactInfo = new Schema({
  type: { type: String, default: '' },
  contact: { type: String, default: '' }
});

var schema = new Schema({
  meta: meta,
  firstName: { type: String, default: '' },
  lastName: { type: String, default: '' },
  ssno: { type: String, default: '' },
  address: { type: String, default: '' },
  zip: { type: String, default: '' },
  city: { type: String, default: '' },
  phone: [contactInfo],
  email: [contactInfo],
  details: {
    danmark: {
      type : { type: String, default: '' },
      enum : [
        '',
        'Gruppe 5',
        'Gruppe 1',
        'Gruppe 2',
        'Basis-Sygeforsikring'
      ]
    },
    insurance: {
      type : { type: String, default: '' },
      enum : [
        '',
        'Gruppe 1',
        'Gruppe 2'
      ]
    },
    municipality: { type: String, default: '' },
    reminder: { type: Boolean, default: false },
    subsidy: { type: Number, default: 0 },
    notes: { type: String, default: '' }
  },
  journalEntries: [
    {
      type: Schema.Types.ObjectId,
      ref: 'JournalEntry'
    }
  ]
});

schema.set('toJSON', { virtuals: true, getters: true })
schema.set('toObject', { virtuals: true, getters: true })

var model = mongoose.model('Client', schema);

module.exports = model;