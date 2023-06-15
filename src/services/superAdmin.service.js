const httpStatus = require('http-status');
const bcrypt = require('bcryptjs');
const { SuperAdmin } = require('../models');
const ApiError = require('../utils/ApiError');

const createSuperAdmin = async (superadminBody) => {
  return await SuperAdmin.create(superadminBody);
};

const loginSuperAdminWithEmailAndPassword = async (email, password) => {
  const superAdmin = await getVendorByEmail(email);
  if (!superAdmin || !(await SuperAdmin.isPasswordMatch(password))) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Incorrect email or password');
  }
  return superAdmin;
};

const getSuperAdminById = async (id) => {
  const superAdmin = await SuperAdmin.findById(id);
  if (!superAdmin) {
    throw new ApiError(httpStatus.NOT_FOUND);
  }
  return superAdmin;
};

const updatesuperAdminById = async (superAdminId, updateBody) => {
  const superAdmin = await getSuperAdminById(superAdminId);
  if (!superAdmin) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Vendor not found');
  }
  if (updateBody.email && (await SuperAdmin.isEmailTaken(updateBody.email, superAdminId))) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Email already taken');
  }
  // //console.log(JSON.stringify(updateBody));
  const updatedAdmin = await superAdmin.findOneAndUpdate({ _id: superAdminId }, updateBody, { new: true });
  await updatedAdmin.save();
  return updatedAdmin;
};

const resetPassword = async (superAdminId, newPassword) => {
  const superAdmin = await getSuperAdminById(superAdminId);
  if (!superAdmin) {
    throw new ApiError(httpStatus.NOT_FOUND, 'superAdmin not found');
  }
  const password = await bcrypt.hash(newPassword, 8);
  const resetedPassword = await SuperAdmin.findOneAndUpdate({ _id: superAdminId }, { password });
  await resetedPassword.save();
  return resetedPassword;
};

const listSuperAdmin = async () => {
  const superAdmin = await SuperAdmin.find({ active: true });
  return superAdmin.map((vendor) => {
    return {
      id: superAdmin.id,
      name: superAdmin.name,
    };
  });
};

module.exports = {
  createSuperAdmin,
  getSuperAdminById,
  loginSuperAdminWithEmailAndPassword,
  listSuperAdmin,
  resetPassword,
  updatesuperAdminById,
};
