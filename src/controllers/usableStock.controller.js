const pick = require('../utils/pick');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const usableStockService = require('../services/usable.service');

const createUsableStock = catchAsync(async (req, res) => {
  const usable = await usableStockService.createUsableStock(req.body);
  res.send(usable);
});

const getAllUsableStock = catchAsync(async (req, res) => {
  const usable = await usableStockService.getAllUsableStock();
  res.send(usable);
});

const getUsableStockById = catchAsync(async (req, res) => {
  const usable = await usableStockService.getUsableStockById(req.params.id);
  res.send(usable);
});

const updateUsableStockbyId = catchAsync(async (req, res) => {
  const usable = await usableStockService.updateUsableStockbyId(req.params.id, req.body);
  res.send(usable);
});
const getAssignStockbyId = catchAsync(async (req, res) => {
  const usable = await usableStockService.getAssignStockbyId(req.params.id);
  if (usable.length == 0) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Stock Not Available');
  }
  res.send(usable[0]);
});

const getStocks = catchAsync(async (req, res) => {
  const usable = await usableStockService.getStocks();
  res.send(usable);
});
const getstockDetails = catchAsync(async (req, res) => {
  const usable = await usableStockService.getstockDetails(req.params.id);
  res.send(usable);
});

const updatestcokDetails = catchAsync(async (req, res) => {
  let usable;
  if (req.body.stock_type == 'Closing') {
    usable = await usableStockService.updatestcokDetails(req.body);
  }
  if (req.body.stock_type == 'Opening') {
    usable = await usableStockService.updatestcokDetails_Opening(req.body);
  }
  if (req.body.stock_type == 'Random') {
    usable = await usableStockService.updatestcokDetails_Random(req.body);
  }
  res.send(usable);
});
const updaterandom_product = catchAsync(async (req, res) => {
  const receicedProduct = await usableStockService.updaterandom_product(req.body, req.userId);
  res.send(receicedProduct);
});
module.exports = {
  createUsableStock,
  getAllUsableStock,
  getUsableStockById,
  updateUsableStockbyId,
  getAssignStockbyId,
  getStocks,
  getstockDetails,
  updatestcokDetails,
  updaterandom_product
};
