const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const date = require('../config/date');
//asdsad
const driverSchema = new Schema({
    driver_id: {
        type: String
    },
    first_name: {
        type: String,
        required: true,
    },
    middle_name: {
        type: String,
        required: true
    },
    last_name: {
        type: String,
        required: true,
    },
    age: {
        type: String,
        required: true,
    },
    company: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        default: date.dateTime,
    },
});

module.exports = mongoose.model('Driver', driverSchema);