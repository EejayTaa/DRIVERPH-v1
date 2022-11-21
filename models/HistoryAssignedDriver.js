const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const date = require('../config/date');

const historyAssigendDriverSchema = new Schema({
  first_name: {
    type: String,
  },
  last_name: {
    type: String,
  },
  company: {
    type: String,
  },
  plate_number: {
      type: String
  },
  startDate: {
    type: Date,
  },
  endDate: {
    type: Date,
    default: date.dateTime
  }
});

module.exports = mongoose.model('HistoryAssignedDriver', historyAssigendDriverSchema);