const httpStatus = require('http-status');
const pick = require('../utils/pick');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const WarehouseStockService = require('../services/warehouseStock..service.');

const createWarehouseStock = catchAsync(async (req, res) => {
  const warehouseStock = await WarehouseStockService.createWarehouseStack(req.body);
  if (!warehouseStock) {
    throw new ApiError(httpStatus.NOT_FOUND, 'WarehouseStock Not Found');
  }
  res.status(httpStatus.CREATED).send(warehouseStock);
});

const getAllWarehouseStock = catchAsync(async (req, res) => {
  const warehouseStock = await WarehouseStockService.getAllWarehouseStock(req.params);
  res.send(warehouseStock);
});

const getWarehouseStockById = catchAsync(async (req, res) => {
  const warehouseStock = await WarehouseStockService.getWarehouseStockById(req.params.warehouseStockId);
  if (!warehouseStock || warehouseStock.active === false) {
    throw new ApiError(httpStatus.NOT_FOUND, 'WarehouseStock Not Found');
  }
  res.send(warehouseStock);
});
const updateWarehouseStock = catchAsync(async (req, res) => {
  const warehouseStock = await WarehouseStockService.updateWorkhouseStockById(req.params.warehouseStockId, req.body);
  res.send(warehouseStock);
});

const deleteWarehouseStockById = catchAsync(async (req, res) => {
  await WarehouseStockService.deleteWarehouseStockById(req.params.warehouseStockId);
  res.status(httpStatus.NO_CONTENT).send();
});

module.exports = {
  createWarehouseStock,
  getAllWarehouseStock,
  getWarehouseStockById,
  updateWarehouseStock,
  deleteWarehouseStockById,
};
