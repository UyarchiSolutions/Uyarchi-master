const httpStatus = require('http-status');
const { ManageIssues } = require('../models');
const ApiError = require('../utils/ApiError');

const createManageIssues = async (manageIssuesBody) => {
  return ManageIssues.create(manageIssuesBody);
};
const getManageIssuesById = async (id) => {
  const manageIssues = ManageIssues.findOne({ active: true });
  if (!manageIssues) {
    throw new ApiError(httpStatus.NOT_FOUND, 'ManageIssues Not Found');
  }
  return manageIssues;
};
const getAllManageIssues = async () => {
  return ManageIssues.find();
};
const queryManageIssues = async (filter, options) => {
  return ManageIssues.paginate(filter, options);
};

const updateManageIssuesById = async (manageIssuesId, updateBody) => {
  let manageIssues = await getManageIssuesById(manageIssuesId);
  if (!manageIssues) {
    throw new ApiError(httpStatus.NOT_FOUND, 'ManageIssues not found');
  }
  manageIssues = await ManageIssues.findByIdAndUpdate({ _id: manageIssuesId }, updateBody, { new: true });
  return manageIssues;
};

const deleteManageIssuesById = async (manageIssuesId) => {
  const manageIssues = await getManageIssuesById(manageIssuesId);
  if (!manageIssues) {
    throw new ApiError(httpStatus.NOT_FOUND, 'ManageIssues not found');
  }
  (manageIssues.active = false), (manageIssues.archive = true), await manageIssues.save();
  return manageIssues;
};

module.exports = {
  createManageIssues,
  getManageIssuesById,
  getAllManageIssues,
  queryManageIssues,
  updateManageIssuesById,
  deleteManageIssuesById,
};
