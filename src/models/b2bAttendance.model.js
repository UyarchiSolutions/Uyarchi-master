const mongoose = require('mongoose');
const { v4 } = require('uuid');

const AttendanceSchema = mongoose.Schema({
  _id: {
    type: String,
    default: v4,
  },
  b2bUser: {
    type: String,
  },

  month: {
    type: String,
  },
  days: {
    type: Number,
  },

  TotalAbsentDays: {
    type: Number,
  },

  ApprovedAbsentDays: {
    type: Number,
  },

  TotalWorkingDays: {
    type: Number,
  },

  leaveReduceAmounts: {
    type: Number,
  },

  payingSalary: {
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

const Attendance = mongoose.model('attendance', AttendanceSchema);

module.exports = Attendance;
