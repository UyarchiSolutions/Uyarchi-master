const httpStatus = require('http-status');
const PUserSalary = require('../models/purchaseUserSalaryInfo.model');
const ApiError = require('../utils/ApiError');

const createUserSalary = async (userBody) => {
  const usersalaryinfo = await PUserSalary.create(userBody);
  return usersalaryinfo;
};

const getAllUserSalaryInfo = async () => {
  return await PUserSalary.aggregate([
    {
      $lookup: {
        from: 'superadminwardassigns',
        localField: 'userId',
        foreignField: '_id',
        as: 'userData',
      },
    },
  ]);
};

const getUsersalaryInfoById = async (id) => {
  const usersalaryInfo = await PUserSalary.findById(id);
  if (!usersalaryInfo) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User Not Found');
  }
  return usersalaryInfo;
};

const updateUserSalaryInfoById = async (id, updatebody) => {
  let usersalaryInfo = await getUsersalaryInfoById(id);
  if (!usersalaryInfo) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User Not Found');
  }
  usersalaryInfo = await PUserSalary.findByIdAndUpdate({ _id: id }, updatebody, { new: true });
  return usersalaryInfo;
};

const updateUserSalaryStatus = async (id) => {
  let usersalaryInfo = await getUsersalaryInfoById(id);
  if (!usersalaryInfo) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User Not Found');
  }
  usersalaryInfo = await PUserSalary.findByIdAndUpdate({ _id: id }, { status: 'Passive' }, { new: true });
  return usersalaryInfo;
};

const deleteUserSalaryInfo = async (id) => {
  const usersalaryInfo = await getUsersalaryInfoById(id);
  if (!usersalaryInfo) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User Not Found');
  }
  (usersalaryInfo.active = false), (usersalaryInfo.archive = true), await usersalaryInfo.save();
  return usersalaryInfo;
};

module.exports = {
  createUserSalary,
  getUsersalaryInfoById,
  getAllUserSalaryInfo,
  updateUserSalaryInfoById,
  updateUserSalaryStatus,
  deleteUserSalaryInfo,
};
