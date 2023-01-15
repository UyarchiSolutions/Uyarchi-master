const httpStatus = require('http-status');
const pick = require('../utils/pick');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const manageIssuesService = require('../services/manageIssues.service');

const createManageIssues = catchAsync(async (req, res) => {
  const manageIssues = await manageIssuesService.createManageIssues(req.body);
  if (!manageIssues) {
    throw new ApiError(httpStatus.NOT_FOUND, 'ManageIssues Not Fount.');
  }
  res.status(httpStatus.CREATED).send(manageIssues);
});

const getAllManageIssues = catchAsync(async (req, res) => {
  const manageIssues = await manageIssuesService.getAllManageIssues(req.params);
  res.send(manageIssues);
});

const getManageIssuesById = catchAsync(async (req, res) => {
  const manageIssues = await manageIssuesService.getManageIssuesById(req.params.manageIssuesId);
  if (!manageIssues || manageIssues.active === false) {
    throw new ApiError(httpStatus.NOT_FOUND, 'ManageIssues not found');
  }
  res.send(manageIssues);
});

const updateManageIssues = catchAsync(async (req, res) => {
  const manageIssues = await manageIssuesService.updateManageIssuesById(req.params.manageIssuesId, req.body);
  res.send(manageIssues);
});

const deleteManageIssuesById = catchAsync(async (req, res) => {
  await manageIssuesService.deleteManageIssuesById(req.params.manageIssuesId);
  res.status(httpStatus.NO_CONTENT).send();
});

module.exports = {
  createManageIssues,
  getManageIssuesById,
  getAllManageIssues,
  updateManageIssues,
  deleteManageIssuesById,
};
