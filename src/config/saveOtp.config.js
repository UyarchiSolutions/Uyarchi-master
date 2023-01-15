const OTP = require('../models/chatBot.OTP.model');
const moment = require('moment');

const saveOtp = async (number, otp) => {
  console.log(number)
  return await OTP.create({
    OTP: otp,
    mobileNumber:number,
    date: moment().format('YYYY-MM-DD'),
  });
};
module.exports = { saveOtp };
