const mongoose = require('mongoose');
const { v4 } = require('uuid');
const moment = require('moment');

const monthlyRecuringSchema = mongoose.Schema({
  _id: {
    type: String,
    default: v4,
  },
  expType: {
    type: String,
  },
  recuringType: {
    type: String,
  },
  location: {
    type: String,
  },
  address: {
    type: String,
  },
  use: {
    type: String,
  },
  amount: {
    type: Number,
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
    default: moment().utcOffset(330).format('DD-MM-yyy'),
  },
  time: {
    type: String,
    default: moment().utcOffset(330).format('h:mm a'),
  },
  vehicleType: {
    type: String,
  },
  vehicleNo: {
    type: String,
  },
  amounts: {
    type: Number,
  },
  endDate: {
    type: String,
  },
});

const monthlyRecuring = mongoose.model('monthlyRecuring', monthlyRecuringSchema);

module.exports = monthlyRecuring;
