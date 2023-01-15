const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');
const { OTPModel } = require('../models/RegisetOtp.model');

const verfiy = async (otp, mobileNumber) => {
  let verify = await OTPModel.findOne({ OTP: otp, mobileNumber: mobileNumber });
  if (!verify || verfiy == null) {
    throw new ApiError(httpStatus.NOT_FOUND, 'OTP Is Wrong Or Invalid');
  }
  await OTPModel.deleteOne({ OTP: otp, mobileNumber: mobileNumber });
  return 'verified Successfully';
};

module.exports = { verfiy };
