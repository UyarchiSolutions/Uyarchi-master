const httpStatus = require('http-status');
const { Assign } = require('../models');
const ApiError = require('../utils/ApiError');

const createAssign = async (assignBody) => {
  return Assign.create(assignBody);
};

const getAssignById = async (id) => {
  return Assign.findById(id);
};

const getAllassign = async () => {
  return Assign.find();
};

const updateAssignById = async (assignId, updateBody) => {
  let assign = await getAssignById(assignId);
  if (!assign) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Assign not found');
  }
  assign = await Assign.findByIdAndUpdate({ _id: assignId }, updateBody, { new: true });
  return assign;
};
const deleteAssignById = async (assignId) => {
  const assign = await getBusinessById(assignId);
  if (!assign) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Assign not found');
  }
  await assign.remove();
  return assign;
};
module.exports = {
  createAssign,
  getAssignById,
  getAllassign,
  updateAssignById,
  deleteAssignById,
};
