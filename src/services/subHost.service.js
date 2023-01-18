const httpStatus = require('http-status');
const SubHost = require('../models/subHost.model');
const ApiError = require('../utils/ApiError');
const moment = require('moment');
const TextLocal = require('../config/subHost.TextLocal');
const subHostOTP = require('../models/saveSubHostOTP.model');
const createSubHost = async (body) => {
  const data = { ...body, ...{ created: moment() } };
  let exist = await SubHost.findOne({ phoneNumber: data.phoneNumber });
  if (exist) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Phone Number Already Exist');
  }
  const values = await SubHost.create(data);
  return values;
};

const getActiveSubHosts = async () => {
  let values = await SubHost.find({ active: true });
  return values;
};

// send OTP For first Time USers

const SendOtp = async (body) => {
  let values = await SubHost.findOne({ phoneNumber: body.phoneNumber });
  console.log(values);
  if (!values) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Mobile Number Invalid');
  }
  return await TextLocal.Otp(body, values);
};

// verify OTP

const verifyOTP = async (body) => {
  const OTP = await subHostOTP.findOne({ OTP: body.OTP, active: true }).sort({ created: -1 });
  if (!OTP) {
    throw new ApiError(httpStatus.NOT_FOUND, 'OTP Invalid');
  }
  OTP = await subHostOTP.findByIdAndUpdate({ _id: OTP._id }, { active: false }, { new: true });
  return { Message: 'OTP verify SuccessFully' };
};

module.exports = {
  createSubHost,
  getActiveSubHosts,
  SendOtp,
  verifyOTP,
};
