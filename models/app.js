var mongoose = require('mongoose');
var Schema = mongoose.Schema;

require('./user');

var schema = new Schema({
  domain: {
    type: String,
    lowercase: true,
    index: {
      unique: true
    }
  },
  name : String,
  users: [
    {
      type: Schema.Types.ObjectId,
      ref: 'User'
    }
  ]
});

var model = mongoose.model('App', schema);

module.exports = model;