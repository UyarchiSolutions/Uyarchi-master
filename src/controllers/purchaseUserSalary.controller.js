const httpStatus = require('http-status');
const pick = require('../utils/pick');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const PUserSalaryService = require('../services/purchaseUserSalaryInfo.service');

const createPusersalaryInfo = catchAsync(async (req, res) => {
  const usersalary = await PUserSalaryService.createUserSalary(req.body);
  if (!usersalary) {
    throw new ApiError(httpStatus.NOT_FOUND, 'usersalary Not Fount.');
  }
  res.status(httpStatus.CREATED).send(usersalary);
});

const getPusersalaryInfoById = catchAsync(async (req, res) => {
  const usersalaryInfo = await PUserSalaryService.getUsersalaryInfoById(req.params.id);
  //console.log(usersalaryInfo);
  if (!usersalaryInfo || usersalaryInfo.active == false) {
    throw new ApiError(httpStatus.NOT_FOUND, 'user not found');
  }
  res.send(usersalaryInfo);
});

const getAllPusers = catchAsync(async (req, res) => {
  const usersalaryInfo = await PUserSalaryService.getAllUserSalaryInfo();
  res.send(usersalaryInfo);
});

const updatePusersById = catchAsync(async (req, res) => {
  const usersalaryInfo = await PUserSalaryService.updateUserSalaryInfoById(req.params.id, req.body);
  if (!usersalaryInfo || usersalaryInfo.active == false) {
    throw new ApiError(httpStatus.NOT_FOUND, 'user Not Found');
  }
  res.send(usersalaryInfo);
});

const updateUserStatus = catchAsync(async (req, res) => {
  const usersalaryInfo = await PUserSalaryService.updateUserSalaryStatus(req.params.id);
  if (!usersalaryInfo || usersalaryInfo.active == false) {
    throw new ApiError(httpStatus.NOT_FOUND, 'user Not Found');
  }
  res.send(usersalaryInfo);
});

const deletePuserSalaryInfo = catchAsync(async (req, res) => {
  const usersalaryInfo = await PUserSalaryService.deleteUserSalaryInfo(req.params.id);
  if (!usersalaryInfo || usersalaryInfo.active == false) {
    throw new ApiError(httpStatus.NOT_FOUND, 'user Not Found');
  }
  res.send();
});

module.exports = {
  createPusersalaryInfo,
  getPusersalaryInfoById,
  getAllPusers,
  updatePusersById,
  updateUserStatus,
  deletePuserSalaryInfo,
};
