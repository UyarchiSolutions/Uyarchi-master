const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const attendancePayemntService = require('../services/b2b.attendancePayement.service');
const httpStatus = require('http-status');

const createAttendancePayment = catchAsync(async (req, res) => {
  const payment = await attendancePayemntService.createAttendancePayment(req.body);
  res.send(payment);
});

module.exports = {
  createAttendancePayment,
};
