const mongoose = require('mongoose');
const { v4 } = require('uuid');
const moment = require('moment');
const vehicleSchema = mongoose.Schema({
  _id: {
    type: String,
    default: v4,
  },
  vehicleName: {
    type: String,
  },
  vehicleType: {
    type: String,
  },
  RCBookId: {
    type: String,
  },
  RcBookImage: {
    type: String,
  },
  vehicleImage: {
    type: String,
  },
  active: {
    type: Boolean,
    default: true,
  },
  archive: {
    type: Boolean,
    default: false,
  },
  date: {
    type: String,
  },
  time: {
    type: String,
  }
 

});

const vehicle = mongoose.model('vehicleAllocation', vehicleSchema);

module.exports = vehicle;
