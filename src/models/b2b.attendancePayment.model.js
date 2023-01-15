const mongoose = require('mongoose');
const { v4 } = require('uuid');
const moment = require('moment');

const attendancePayment = mongoose.Schema({
  _id: {
    type: String,
    default: v4,
  },
  status: {
    type: String,
  },
  GpayNo: {
    type: Number,
  },
  payAmount: {
    type: Number,
  },
  payType: {
    type: String,
  },
  date: {
    type: String,
    default: moment().utcOffset(530).format('DD-MM-yyy'),
  },
  time: {
    type: String,
    default: moment().utcOffset(530).format('h:mm a'),
  },
  userId: {
    type: String,
  },
});

const paymentAttendance = mongoose.model('attendancePayment', attendancePayment);

module.exports = paymentAttendance;
