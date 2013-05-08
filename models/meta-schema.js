'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

require('./app');
require('./user');

var schema = {
  owner: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  app : {
    type: Schema.Types.ObjectId,
    ref: 'App'
  },
  createdAt : {
    type : Date
  }
};

module.exports = schema;