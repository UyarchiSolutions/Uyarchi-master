const { OTPModel } = require('../models/supplierRegisterOtp.model');

const saveOtp = async (number, otp) => {
  return await OTPModel.create({
    OTP: otp,
    mobileNumber: number,
    // userId: user._id,
  });
};

const updateOtp = async (number, otp) => {
  //console.log(number, otp)
  return await OTPModel.findOneAndUpdate({mobileNumber:number}, { OTP:otp }, { new: true })
};

module.exports = { saveOtp, updateOtp };