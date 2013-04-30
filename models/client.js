var mongoose = require('mongoose');
var Schema = mongoose.Schema;

require('./journal-entry');
require('./app');
require('./user');

var contactInfo = new Schema({
  type: String,
  contact: String
});

var schema = new Schema({
  app: {
    type: Schema.Types.ObjectId,
    ref: 'App'
  },
  owner: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  firstName: String,
  lastName: String,
  ssno: String,
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
  journals: [
    {
      type: Schema.Types.ObjectId,
      ref: 'JournalEntry'
    }
  ]
});

var model = mongoose.model('Client', schema);

module.exports = model;