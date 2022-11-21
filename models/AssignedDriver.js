const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const date = require('../config/date');

const assignedDriverSchema = new Schema({
  first_name: {
    type: String
  },
  last_name: {
    type: String,
  },
  company: {
    type: String,
  },
  date: {
    type: Date,
    default: date.dateTime,
  },
});

module.exports = mongoose.model('AssignedDriver', assignedDriverSchema);