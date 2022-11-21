const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const date = require('../config/date');

const profileSchema = new Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    company: {
        type: String,
        required: true
    },
    location: {
        type: String,
        required: true
    },
    social: {
        facebook: {
            type: String
        },
        twitter: {
            type: String
        },
        linkedin: {
            type: String
        },
        instagram: {
            type: String
        }
    },
    date: {
        type: Date,
        default: date.dateTime,
      },
});

module.exports = new mongoose.model('Profile', profileSchema);