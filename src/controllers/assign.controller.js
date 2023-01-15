const httpStatus = require('http-status');
const pick = require('../utils/pick');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const assignService = require('../services/assign.service');

const createAssign = catchAsync(async (req, res) => {
  const assign = await assignService.createAssign(req.body);
  if (!assign) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Assign Not Fount');
  }
  res.status(httpStatus.CREATED).send(assign);
});

const getAssignbyId = catchAsync(async (req, res) => {
  const assign = await assignService.getAssignById(req.params.assignId);
  if (!assign) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Assign not found');
  }
  res.send(assign);
});

const getAllAssign = catchAsync(async (req, res) => {
  const assign = await assignService.getAllassign(req.params);
  if (!assign) {
    throw new ApiError(httpStatus.NOT_FOUND);
  }
  res.send(assign);
});

const updateAssignById = catchAsync(async (req, res) => {
  const assign = await assignService.updateAssignById(req.params.assignId, req.body);
  res.send(assign);
});

const deleteAssignById = catchAsync(async (req, res) => {
  await assignService.deleteAssignById(req.params.assignId);
  res.status(httpStatus.NO_CONTENT).send();
});

module.exports = {
  createAssign,
  getAllAssign,
  getAssignbyId,
  updateAssignById,
  deleteAssignById,
};
