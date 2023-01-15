const httpStatus = require('http-status');
const pick = require('../utils/pick');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const ReceivedStockService = require('../services/receivedStock.service');
const ReceivedStock = require('../models/receivedStock.model');

const getDataById = catchAsync(async (req, res) => {
  const receivedStock = await ReceivedStockService.getDataById(req.params.id);
  res.send(receivedStock);
});

const uploadImageById = catchAsync(async (req, res) => {
  let receivedStock = await ReceivedStockService.uploadImageById(req.params.id, req.body);
  if (req.files.length != 0) {
    req.files.forEach((element) => {
      receivedStock.wastageImg.push('images/receivedstockimg/' + element.filename);
    });
  }
  res.send(receivedStock);
});

const updateReceivedStockById = catchAsync(async (req, res) => {
  const receivedStock = await ReceivedStockService.updateReceivedStockById(req.params.id, req.body);
  res.send(receivedStock);
});
const updatesegrecation = catchAsync(async (req, res) => {
  const receivedStock = await ReceivedStockService.updatesegrecation(req.params.id, req.body);
  res.send(receivedStock);
});

const getDataByLoading = catchAsync(async (req, res) => {
  const receivedStock = await ReceivedStockService.getDataByLoading(req.params.id);
  res.send(receivedStock);
});

const getDetailsByProductId = catchAsync(async (req, res) => {
  const receivedStock = await ReceivedStockService.getDetailsByProductId(req.params.productId, req.params.date);
  res.send(receivedStock);
});

const updateusableStock = catchAsync(async (req, res) => {
  const receivedStock = await ReceivedStockService.updateusableStock(req.params.id, req.body);
  if (req.files.length != 0) {
    let path = '';
    req.files.forEach(function (files, index, arr) {
      path = 'images/usablestock/' + files.filename;
    });
    receivedStock.wastageImage = path;
  }
  await stock.save();
  res.send(receivedStock);
});

module.exports = {
  getDataById,
  updateReceivedStockById,
  getDataByLoading,
  getDetailsByProductId,
  updatesegrecation,
  uploadImageById,
  updateusableStock,
};
