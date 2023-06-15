// const OTP = require('../models/chatBot.OTP.model');
const { OTP } = require('../models/saveOtp.model');
const moment = require('moment');
const CustomerOTP = require('../models/customer.otp.model');

const saveOtp = async (number, otp,user) => {
  //console.log(number);
  return await OTP.create({
    OTP: otp,
    mobileNumber: number,
    date: moment().format('YYYY-MM-DD'),
    userId:user._id,
    created:moment()
  });
};
const customersaveOTP = async (number, otp) => {
  return await CustomerOTP.create({
    OTP: otp,
    mobileNumber: number,
  });
};
module.exports = { saveOtp, customersaveOTP };
