'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

require('./app');

var schema = new Schema({
  email: { type: String, lowercase: true },
  displayName : { type: String },
  avatar : { type: String },
  providers : [
    {
      providerName : { type: String },
      providerId : { type: String, unique: true },
      refreshToken : { type: String }
    }
  ],
  apps: [
    { type: Schema.Types.ObjectId, ref: 'App' }
  ]
});

var model = mongoose.model('User', schema);

module.exports = model;