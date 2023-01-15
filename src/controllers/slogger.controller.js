const httpStatus = require('http-status');
const pick = require('../utils/pick');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const sloggerService = require('../services/slogger.service');

const createSlogger = catchAsync(async (req, res) => {
  const slogger = await sloggerService.createSlogger(req.body);
  if (!slogger) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Slogger Not Fount.');
  }
  res.status(httpStatus.CREATED).send(slogger);
});

// const getBusinessDetails = catchAsync(async (req, res) => {
//   const filter = pick(req.query, ['salesProduct', 'shippingCost']);
//   const options = pick(req.query, ['sortBy', 'limit', 'page']);
//   const result = await BusinessService.queryBusiness(filter, options);
//   res.send(result);
// });

const getSloggerById = catchAsync(async (req, res) => {
  const slogger = await sloggerService.getSloggerById(req.params.sloggerId);
  if (!slogger || slogger.active === false) {
    throw new ApiError(httpStatus.NOT_FOUND, 'slogger not found');
  }
  res.send(slogger);
});

const updateSlogger = catchAsync(async (req, res) => {
  const slogger = await sloggerService.updateSloggerById(req.params.sloggerId, req.body);
  res.send(slogger);
});

const deleteSloggerById = catchAsync(async (req, res) => {
  await sloggerService.deleteSloggerById(req.params.sloggerId);
  res.status(httpStatus.NO_CONTENT).send();
});

module.exports = {
  createSlogger,
  getSloggerById,
  updateSlogger,
  deleteSloggerById,
};
