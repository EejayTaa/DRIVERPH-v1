const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const date = require('../config/date');

const sensorSchema = new Schema({
  assigned_driver: {
    type: String,
  },
  date_assigned: {
    type: Date,
  },
  plate_number: {
    type: String,
  },
  server_date: {
    type: String,
  },
  sensor_date: {
    type: String,
  },
  company: {
    type: String
  },
  utc_time: {
    type: Number,
  },
  gyro_sensor_acceleration_x: {
    type: Number,
  },
  gyro_sensor_acceleration_y: {
    type: Number,
  },
  gyro_sensor_acceleration_z: {
    type: Number,
  },
  gyro_sensor_rotation_x: {
    type: Number,
  },
  gyro_sensor_rotation_y: {
    type: Number,
  },
  gyro_sensor_rotation_z: {
    type: Number,
  },
  ultrasonic_sensor: {
    type: Number,
  },
  sound_sensor: {
    type: Number,
  },
  alcohol_sensor: {
    type: Number,
  },
  gyro_sensor_temperature: {
    type: Number,
  },
  latitude: {
    type: Number,
  },
  longitude: {
    type: Number,
  },
  min_gps_speed: {
    type: Number,
  },
  max_gps_speed: {
    type: Number,
  },
  img_filename: {
    type: String,
  },
  img_filepath: {
    type: String,
  },
  img_contentType: {
    type: String,
  },
  log_filename: {
    type: String,
  },
  log_filepath:{
    type: String,
  },
  log_contentType: {
    type: String
  },
  status_1: {
    type: String
  },
  status_2: {
    type: String
  },
  status_3:{
    type: String
  },
  status_4: {
    type: String
  },
  year: {
    type: String,
  },
  month: {
    type: String,
  },
  day: {
    type: String,
  },
  date: {
    type: Date,
    default: date.dateTime,
  },
});
module.exports = mongoose.model('Sensor', sensorSchema);
