const httpStatus = require('http-status');
const { LoadingExecute } = require('../models');
const Scv = require('../models/vendor.model');
const ApiError = require('../utils/ApiError');

const createLoadingExecute = async (loadingExecuteBody) => {
  const { scvId } = loadingExecuteBody;
  let scv = await Scv.findById(scvId);
  if (scv === null) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Street Cart Vendor Not Found 😞');
  }
  return LoadingExecute.create(loadingExecuteBody);
};
const getLoadingExecuteById = async (id) => {
  const loadingexecute = LoadingExecute.findOne({ active: true });
  if (!loadingexecute) {
    throw new ApiError(httpStatus.NOT_FOUND, 'LoadingExecute  Not Found');
  }
  return loadingexecute;
};
const getAllLoadingExecute = async () => {
  return LoadingExecute.find();
};
const queryLoadingExecute = async (filter, options) => {
  return LoadingExecute.paginate(filter, options);
};

const updateloadingExecuteById = async (loadingExecuteId, updateBody) => {
  let loadingexecute = await getLoadingExecuteById(loadingExecuteId);
  if (!loadingexecute) {
    throw new ApiError(httpStatus.NOT_FOUND, 'LoadingExecute not found');
  }
  loadingexecute = await LoadingExecute.findByIdAndUpdate({ _id: loadingExecuteId }, updateBody, { new: true });
  return loadingexecute;
};

const deleteLoadingExecuteById = async (loadingExecuteId) => {
  const loadingExecute = await getLoadingExecuteById(loadingExecuteId);
  if (!loadingExecute) {
    throw new ApiError(httpStatus.NOT_FOUND, 'LoadingExecute not found');
  }
  (loadingExecute.active = false), (loadingExecute.archive = true), await loadingExecute.save();
  return loadingExecute;
};

module.exports = {
  createLoadingExecute,
  getAllLoadingExecute,
  updateloadingExecuteById,
  queryLoadingExecute,
  updateloadingExecuteById,
  deleteLoadingExecuteById,
  getLoadingExecuteById,
};
