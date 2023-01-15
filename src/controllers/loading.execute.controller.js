const httpStatus = require('http-status');
const pick = require('../utils/pick');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const loadingExecuteService = require('../services/loading.execute.service');

const createloadingExecute = catchAsync(async (req, res) => {
  const loadingExecute = await loadingExecuteService.createLoadingExecute(req.body);
  if (!loadingExecute) {
    throw new ApiError(httpStatus.NOT_FOUND, 'LoadingExecute Not Fount.');
  }
  res.status(httpStatus.CREATED).send(loadingExecute);
});

const getAllLoadingExecute = catchAsync(async (req, res) => {
  const loadingExecute = await loadingExecuteService.getAllLoadingExecute(req.params);
  res.send(loadingExecute);
});

const getloadingExecuteById = catchAsync(async (req, res) => {
  const loadingExecute = await loadingExecuteService.getLoadingExecuteById(req.params.loadingExecuteId);
  if (!loadingExecute || loadingExecute.active === false) {
    throw new ApiError(httpStatus.NOT_FOUND, 'LoadingExecute not found');
  }
  res.send(loadingExecute);
});

const updateloadingExecuteById = catchAsync(async (req, res) => {
  const loadingexecute = await loadingExecuteService.updateloadingExecuteById(req.params.loadingExecuteId, req.body);
  res.send(loadingexecute);
});

const deleteloadingExecuteById = catchAsync(async (req, res) => {
  await loadingExecuteService.deleteLoadingExecuteById(req.params.loadingExecuteId);
  res.status(httpStatus.NO_CONTENT).send();
});

module.exports = {
  createloadingExecute,
  getAllLoadingExecute,
  getloadingExecuteById,
  updateloadingExecuteById,
  deleteloadingExecuteById,
};
