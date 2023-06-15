const httpStatus = require('http-status');
const bcrypt = require('bcryptjs');
const { Vendor } = require('../models');
const ApiError = require('../utils/ApiError');

const createVendor = async (vendorBody) => {
  const { password, confirmPassword } = vendorBody;
  if (password !== confirmPassword) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Password Does Not Match 😞');
  }
  if (await Vendor.isEmailTaken(vendorBody.email)) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Email already taken');
  }
  return Vendor.create(vendorBody);
};

const getVendorByEmail = async (email) => {
  return Vendor.findOne({ email });
};

const loginVendorWithEmailAndPassword = async (email, password) => {
  const vendor = await getVendorByEmail(email);
  if (!vendor || !(await vendor.isPasswordMatch(password))) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Incorrect email or password');
  }
  return vendor;
};

const queryVendor = async (filter, options) => {
  const vendor = await Vendor.paginate(filter, options);
  return vendor;
};

const getVendorById = async (_id) => {
  return Vendor.findOne({ _id, active: true });
};

const updateVendorById = async (vendorId, updateBody) => {
  const vendor = await getVendorById(vendorId);
  if (!vendor) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Vendor not found');
  }
  if (updateBody.email && (await Vendor.isEmailTaken(updateBody.email, vendorId))) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Email already taken');
  }
  // //console.log(JSON.stringify(updateBody));
  const updatedVendor = await Vendor.findOneAndUpdate({ _id: vendorId }, updateBody, { new: true });
  await updatedVendor.save();
  return updatedVendor;
};

const resetPassword = async (vendorId, newPassword) => {
  const vendor = await getVendorById(vendorId);
  if (!vendor) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Vendor not found');
  }
  const password = await bcrypt.hash(newPassword, 8);
  const resetedPassword = await Vendor.findOneAndUpdate({ _id: vendorId }, { password });
  await resetedPassword.save();
  return resetedPassword;
};

const changePassword = async (vendorId, oldPassword, newPassword) => {
  const vendor = await getCustomerById(vendorId);
  if (!vendor) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Vendor not found');
  }
  const isPasswordMatched = await vendor.isPasswordMatch(oldPassword);
  if (!isPasswordMatched) {
    throw new ApiError(httpStatus.NOT_FOUND, "Password doesn't Match");
  }
  const password = await bcrypt.hash(newPassword, 8);
  const updatedPassword = await Vendor.findOneAndUpdate({ _id: vendorId }, { password });
  await updatedPassword.save();
  return updatedPassword;
};
const listVendor = async () => {
  const vendor = await Vendor.find({ active: true });
  return vendor.map((vendor) => {
    return {
      id: vendor.id,
      name: vendor.name,
    };
  });
};

module.exports = {
  createVendor,
  loginVendorWithEmailAndPassword,
  queryVendor,
  getVendorByEmail,
  getVendorById,
  updateVendorById,
  resetPassword,
  changePassword,
  listVendor,
};
