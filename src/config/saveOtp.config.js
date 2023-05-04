const OTP = require('../models/chatBot.OTP.model');
const moment = require('moment');
const CustomerOTP = require('../models/customer.otp.model');

const saveOtp = async (number, otp) => {
  console.log(number);
  return await OTP.create({
    OTP: otp,
    mobileNumber: number,
    date: moment().format('YYYY-MM-DD'),
  });
};
const customersaveOTP = async (number, otp) => {
  return await CustomerOTP.create({
    OTP: otp,
    mobileNumber: number,
  });
};
module.exports = { saveOtp, customersaveOTP };
