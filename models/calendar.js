'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

require('./app');
require('./user');

var meta = require('./meta-schema');

var schema = new Schema({
  meta: meta,
  name : { type: String, default: "" },
  color: { type: String, default: "" },
  timeZone : { type: String, default: "Europe/Copenhagen" }
});

schema.set('toJSON', { virtuals: true, getters: true })
schema.set('toObject', { virtuals: true, getters: true })

var model = mongoose.model('Calendar', schema);

module.exports = model;