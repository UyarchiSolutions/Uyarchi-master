const httpStatus = require('http-status');
const pick = require('../utils/pick');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const statusService = require('../services/stsatus.service');

const createStatus = catchAsync(async (req, res) => {
  const status = await statusService.createStatus(req.body);
  if (!status) {
    throw new ApiError(httpStatus.NOT_FOUND, 'status Not Fount.');
  }
  res.status(httpStatus.CREATED).send(status);
});

const getApprovedProductDateWise = catchAsync(async (req, res) => {
  const status = await statusService.getApprovedProductDateWise(req.params.date);
  if (!status) {
    throw new ApiError(httpStatus.NOT_FOUND, 'status Not Found');
  }
  res.send(status);
});

const updateStatusById = catchAsync(async (req, res) => {
  const statuse = await statusService.updatestatusById(req.params.statusId, req.body);
  if (!statuse) {
    throw new ApiError(httpStatus.NOT_FOUND, 'status Not Found');
  }
  res.send(statuse);
});

module.exports = {
  updateStatusById,
  createStatus,
  getApprovedProductDateWise,
};
