const mongoose = require('mongoose');
const { v4 } = require('uuid');
const { toJSON, paginate } = require('./plugins');
const moment = require('moment');
const otpsave = mongoose.Schema({
  name: {
    type: String,
  },
  OTP: {
    type: Number,
  },
  mobileNumber: {
    type: Number,
  },
  date: {
    type: String,
  },
  time: {
    type: String,
  },
  expired: {
    type: Boolean,
  },
  userId: {
    type: String,
  },
  used: {
    type: Boolean,
    default: false,
  },
  active: {
    type: Boolean,
    default: true,
  },
  archive: {
    type: Boolean,
    default: false,
  },
  create: {
    type: String,
  },
});
otpsave.plugin(toJSON);
otpsave.plugin(paginate);
const OTP = mongoose.model('OTP', otpsave);

const sellerotpsave = mongoose.Schema({
  name: {
    type: String,
  },
  OTP: {
    type: Number,
  },
  mobileNumber: {
    type: Number,
  },
  date: {
    type: String,
  },
  time: {
    type: String,
  },
  expired: {
    type: Boolean,
  },
  userId: {
    type: String,
  },
  used: {
    type: Boolean,
    default: false,
  },
  active: {
    type: Boolean,
    default: true,
  },
  archive: {
    type: Boolean,
    default: false,
  },
  create: {
    type: String,
  },
});
sellerotpsave.plugin(toJSON);
sellerotpsave.plugin(paginate);
const sellerOTP = mongoose.model('sellerOTP', sellerotpsave);


module.exports = { OTP, sellerOTP };
