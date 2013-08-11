'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var meta = require('./meta-schema');

require('./client');


var schema = new Schema({
  name : { type: String, default: '' },
  description: { type: String, default: '' },
  price : { type: Number, default: '' },
  children : [
    {
      type: Schema.Types.ObjectId,
      ref : 'JournalHelper'
    }
  ],
  meta: meta
});

var model = mongoose.model('JournalHelper', schema);

module.exports = model;