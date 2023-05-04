const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const { v4 } = require('uuid');
const { toJSON, paginate } = require('./plugins');

const CustomerOTPSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      default: v4,
    },
    mobileNumber: {
      type: Number,
    },
    OTP: {
      type: Number,
    },
    active: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

const CustomerOTP = mongoose.model('customerOTP', CustomerOTPSchema);

module.exports = CustomerOTP;
