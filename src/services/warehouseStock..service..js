const httpStatus = require('http-status');
const { WarehouseStock } = require('../models');
const ApiError = require('../utils/ApiError');

const createWarehouseStack = async (warehouseStockBody) => {
  return WarehouseStock.create(warehouseStockBody);
};

const getWarehouseStockById = async (id) => {
  const warehouseStock = WarehouseStock.findOne({ active: true });
  if (!warehouseStock) {
    throw new ApiError(httpStatus.NOT_FOUND, 'WarehouseStock Not Found');
  }
  return warehouseStock;
};
const getAllWarehouseStock = async () => {
  return WarehouseStock.find();
};
const queryManageIssues = async (filter, options) => {
  return WarehouseStock.paginate(filter, options);
};
const updateWorkhouseStockById = async (warehouseStockId, updateBody) => {
  let warehouseStock = await getWarehouseStockById(warehouseStockId);
  if (!warehouseStock) {
    throw new ApiError(httpStatus.NOT_FOUND, 'wareHouseStock not found');
  }
  warehouseStock = await WarehouseStock.findByIdAndUpdate({ _id: warehouseStockId }, updateBody, { new: true });
  return warehouseStock;
};
const deleteWarehouseStockById = async (warehouseStockId) => {
  const warehouseStock = await getWarehouseStockById(warehouseStockId);
  if (!warehouseStock) {
    throw new ApiError(httpStatus.NOT_FOUND, 'WarehouseStock not found');
  }
  (warehouseStock.active = false), (warehouseStock.archive = true), await warehouseStock.save();
  return warehouseStock;
};
module.exports = {
  createWarehouseStack,
  getWarehouseStockById,
  getAllWarehouseStock,
  updateWorkhouseStockById,
  deleteWarehouseStockById,
};
