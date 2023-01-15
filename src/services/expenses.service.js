const httpStatus = require('http-status');
const { OtherExpenses } = require('../models/expenses.model');
const ApiError = require('../utils/ApiError');

const createOtherExpenses = async (expBody) => {
  return OtherExpenses.create(expBody);
};

const getAllOtherExpenses = async () => {
  return OtherExpenses.find();
};
const getOtherExpById = async (id) => {
  const otherExp = OtherExpenses.findById(id);
  if (!otherExp) {
    throw new ApiError(httpStatus.NOT_FOUND, 'OtherExpenses  Not Found');
  }
  return otherExp;
};

const updateOtherExpById = async (otherExpId, updateBody) => {
  let otherExp = await otherExpId;
  if (!otherExp) {
    throw new ApiError(httpStatus.NOT_FOUND, 'OtherExpenses not found');
  }
  otherExp = await OtherExpenses.findByIdAndUpdate({ _id: otherExpId }, updateBody, { new: true });
  return otherExp;
};

const deleteOtherExpById = async (otherExpId) => {
  const otherExp = await getOtherExpById(otherExpId);
  if (!otherExp) {
    throw new ApiError(httpStatus.NOT_FOUND, 'OtherExpenses not found');
  }
  return otherExp;
};

module.exports = {
  createOtherExpenses,
  getAllOtherExpenses,
  getOtherExpById,
  updateOtherExpById,
  deleteOtherExpById,
};
