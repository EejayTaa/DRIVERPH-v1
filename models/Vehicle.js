const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const date = require('../config/date');

const vehicleSchema = new Schema(
  {
    vehicle_id: {
      type: String,
      required: true,
    },
    vehicle_type: {
      type: String,
      required: true,
    },
    plate_number: {
      type: String,
      required: true,
    },
    sensory_data: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Sensor',
      },
    ],
    history_assigned_driver: [{
      type: Schema.Types.ObjectId,
      ref: 'HistoryAssignedDriver'
    }],
    assigned_driver: [
      {
        type: Schema.Types.ObjectId,
        ref: 'AssignedDriver',
      },
    ],
    date: {
      type: Date,
      default: date.dateTime,
    },
  }
);

module.exports = mongoose.model('Vehicle', vehicleSchema);