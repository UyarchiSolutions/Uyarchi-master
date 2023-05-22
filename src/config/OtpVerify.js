const { OTP } = require('../models/saveOtp.model');
const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');
const token = require('../services/token.service');
const verfiy = async (body, user) => {
  const validate = await OTP.findOne({
    OTP: body.OTP,
    mobileNumber: body.mobileNumber,
    userId: user._id,
    used: false,
  });
  if (!validate) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Incorrect_OTP');
  }
  await OTP.findOneAndUpdate({ _id: validate._id }, { used: true }, { new: true });
  const token_ser = await token.generateAuthTokens_forget(user);
  return token_ser;
};

module.exports = {
  verfiy,
};
