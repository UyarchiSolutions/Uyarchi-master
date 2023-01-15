const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const setTrendsServive = require('../services/set.TrendsValue.service');

const createSetTrends = catchAsync(async (req, res) => {
  const trends = await setTrendsServive.createSetTrendsValue(req.body);
  res.send(trends);
});

const getAllSetTrends = catchAsync(async (req, res) => {
  const trends = await setTrendsServive.getAllSetTrends();
  res.send(trends);
});

const getSetTrendsById = catchAsync(async (req, res) => {
  const trends = await setTrendsServive.getSetTrendsValueById(req.params.id);
  res.send(trends);
});

const getProductDetailsByProductId = catchAsync(async (req, res) => {
  const product = await setTrendsServive.getProductDetailsByProductId();
  res.send(product);
});

const updateSetSalesPriceById = catchAsync(async (req, res) => {
  const trends = await setTrendsServive.updateTrendsValueById(req.params.id, req.body);
  res.send(trends);
});

const deleteTrendsSetValue = catchAsync(async (req, res) => {
  const trends = await setTrendsServive.deleteTrendsSetValue(req.params.id);
  res.send(trends);
});

module.exports = {
  createSetTrends,
  getAllSetTrends,
  getSetTrendsById,
  getProductDetailsByProductId,
  updateSetSalesPriceById,
  deleteTrendsSetValue,
};
