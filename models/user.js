var mongoose = require('mongoose');
var Schema = mongoose.Schema;

require('./app');

var schema = new Schema({
  email: { type: String, lowercase: true },
  apps: [
    { type: Schema.Types.ObjectId, ref: 'App' }
  ]
});

var model = mongoose.model('User', schema);

module.exports = model;