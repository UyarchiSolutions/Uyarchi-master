const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');
const attendancePaymentModel = require('../models/b2b.attendancePayment.model');

const createAttendancePayment = async (attendanceBody) => {
  let attendancePayment = await attendancePaymentModel.create(attendanceBody);
  return attendancePayment;
};

module.exports = {
  createAttendancePayment,
};
