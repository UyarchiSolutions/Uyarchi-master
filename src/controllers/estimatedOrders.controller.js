const httpStatus = require('http-status');
const pick = require('../utils/pick');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const EstimatedOrderService = require('../services/estimated.service.Orders');

const createEstimatedOrders = catchAsync(async (req, res) => {
  const estimate = await EstimatedOrderService.createEstimatedOrders(req.body);
  res.send(estimate);
});

const getEstimatedByDate = catchAsync(async (req, res) => {
  const estimate = await EstimatedOrderService.getEstimatedByDate(req.params.date, req.params.page);
  res.send(estimate);
});

const getEstimatedByDateforPH = catchAsync(async (req, res) => {
  const estimate = await EstimatedOrderService.getEstimatedByDateforPH(req.params.date, req.params.page);
  res.send(estimate);
});
const updateEstimatedOrders = catchAsync(async (req, res) => {
  const estimate = await EstimatedOrderService.updateEstimateById(req.params.id, req.body);
  res.send(estimate);
});

const getSingleProductEstimations = catchAsync(async (req, res) => {
  const estimate = await EstimatedOrderService.getSingleProductEstimations(req.params.id);
  res.send(estimate);
});

const getEstimated_Orders_By_Id_And_date = catchAsync(async (req, res) => {
  const estimate = await EstimatedOrderService.getEstimated_Orders_By_Id_And_date(req.params.id);
  res.send(estimate);
});

const liveStockInfo = catchAsync(async (req, res) => {
  const estimate = await EstimatedOrderService.liveStockInfo(req.params.id);
  res.send(estimate);
});

module.exports = {
  createEstimatedOrders,
  getEstimatedByDate,
  getSingleProductEstimations,
  updateEstimatedOrders,
  getEstimatedByDateforPH,
  getEstimated_Orders_By_Id_And_date,
  liveStockInfo,
};
