const mongoose = require('mongoose');
const { v4 } = require('uuid');
const { toJSON, paginate } = require('./plugins');

const otpSchema = new mongoose.Schema({
  _id: {
    type: String,
    default: v4,
  },
  OTP: {
    type: Number,
  },
  mobileNumber: {
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
});

const OTPModel = new mongoose.model('RegisterOTP', otpSchema);

module.exports = { OTPModel };
