const httpStatus = require('http-status');
const pick = require('../utils/pick');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const assignStockService = require('../services/AssignStock.service');

const createAssignStock = catchAsync(async (req, res) => {
  const assignStock = await assignStockService.createAssignStock(req.body);
  if (!assignStock) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Assign Not Fount');
  }
  res.status(httpStatus.CREATED).send(assignStock);
});

const get_Current_Stock = catchAsync(async (req, res) => {
  const stock = await assignStockService.get_Current_Stock(req.params.id, req.params.date);
  res.send(stock);
});

module.exports = { createAssignStock, get_Current_Stock };
