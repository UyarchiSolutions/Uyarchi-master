const mongoose = require('mongoose');
const { v4 } = require('uuid');
const { toJSON, paginate } = require('./plugins');

const TrackingSchema = new mongoose.Schema({
  _id: {
    type: String,
    default: v4,
  },
  userId: {
    type: String,
  },
  lat: {
    type: String,
  },
  lon: {
    type: String,
  },
  date: {
    type: String,
  },
  capture: {
    type: Array,
  },
  active: {
    type: Boolean,
    default: true,
  },
  created: {
    type: Date,
  },
});

const Tracking = mongoose.model('Tracking', TrackingSchema);

module.exports = Tracking;
