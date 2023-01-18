const httpStatus = require('http-status');
const SubHost = require('../models/subHost.model');
const ApiError = require('../utils/ApiError');
const moment = require('moment');
const TextLocal = require('../config/subHost.TextLocal');
const subHostOTP = require('../models/saveSubHostOTP.model');
const bcrypt = require('bcrypt');

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
  let OTP = await subHostOTP.findOne({ OTP: body.OTP, active: true }).sort({ created: -1 });
  if (!OTP) {
    throw new ApiError(httpStatus.NOT_FOUND, 'OTP Invalid');
  }
  OTP = await subHostOTP.findByIdAndUpdate({ _id: OTP._id }, { active: false }, { new: true });
  return OTP;
};

// set Password For SubHost

const SetPassword = async (number, body) => {
  const { password, confirmPassword } = body;
  let user = await SubHost.findOne({ phoneNumber: number, active: true });
  if (!user) {
    throw new ApiError(httpStatus.NOT_ACCEPTABLE, 'User Not Found');
  }
  if (password !== confirmPassword) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Password Doesn't Match");
  }
  const salt = await bcrypt.genSalt(7);
  let passwor = { password: await bcrypt.hash(password, salt) };
  user = await SubHost.findByIdAndUpdate({ _id: user._id }, { password: passwor.password }, { new: true });
  return user;
};

const login = async (body) => {
  const { phoneNumber, password } = body;
  let user = await SubHost.findOne({ phoneNumber: body.phoneNumber, active: true });
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User Not Found');
  } else {
    if (await user.isPasswordMatch(password)) {
      console.log(password);
    } else {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Password Invalid');
    }
    return user;
  }
};

module.exports = {
  createSubHost,
  getActiveSubHosts,
  SendOtp,
  verifyOTP,
  SetPassword,
  login,
};
