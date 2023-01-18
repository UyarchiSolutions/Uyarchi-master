const SaveOTP = require('../models/saveSubHostOTP.model');
const moment = require('moment');
const createOTP = async (contact, otp, userName) => {
  let data = await SaveOTP.create({
    phoneNumber: contact,
    OTP: otp,
    userName: userName.Name,
    created: moment(),
  });
  return data;
};

module.exports = {
  createOTP,
};
