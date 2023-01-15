const mongoose = require('mongoose');
const { v4 } = require('uuid');

const chatBotOtpSchema = new mongoose.Schema({
  _id: {
    type: String,
    default: v4,
  },
  used: {
    type: Boolean,
    default: false,
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
});

const chatBotOtp = mongoose.model('chatOTP', chatBotOtpSchema);

module.exports = chatBotOtp;
