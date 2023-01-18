const mongoose = require('mongoose');
const { v4 } = require('uuid');
const { toJSON, paginate } = require('./plugins');
const moment = require('moment');

const subHostOTP = new mongoose.Schema({
  _id: {
    type: String,
    default: v4,
  },
  phoneNumber: {
    type: Number,
  },
  OTP: {
    type: Number,
  },
  userName: {
    type: String,
  },
  active: {
    type: Boolean,
    default: true,
  },
  created: {
    type: Date,
  },
});

const SubHostOTP = mongoose.model('subHostotp', subHostOTP);

module.exports = SubHostOTP;
