const httpStatus = require('http-status');
const pick = require('../utils/pick');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const supplierBuyerService = require('../services/supplierBuyer.service');

const createSupplierService = catchAsync(async (req, res) => {
  const supplier = await supplierBuyerService.createSupplierBuyer(req.body);
  res.status(httpStatus.CREATED).send(supplier);
});

const createSupplierBuyerwithType = catchAsync(async (req, res) => {
  const supplier = await supplierBuyerService.createSupplierBuyerwithType(req.params.type);
  res.send(supplier);
});

const getAllSupplierBuyerService = catchAsync(async (req, res) => {
  const supplier = await supplierBuyerService.getAllSupplierBuyer();
  res.send(supplier);
});

const getAllSupplierBuyerDeleteService = catchAsync(async (req, res) => {
  const supplier = await supplierBuyerService.getAllSupplierBuyerDelete();
  res.send(supplier);
});

const getSupplierBuyerByIdService = catchAsync(async (req, res) => {
  const supplier = await supplierBuyerService.getSupplierBuyerById(req.params.supplierBuyerId);
  if (!supplier) {
    throw new ApiError(httpStatus.NOT_FOUND, 'SupplierBuyer Not Found');
  }
  res.send(supplier);
});

const updateSupplierBuyerByIdService = catchAsync(async (req, res) => {
  const supplier = await supplierBuyerService.updateSupplierBuyerById(req.params.supplierBuyerId, req.body);
  if (!supplier) {
    throw new ApiError(httpStatus.NOT_FOUND, 'SupplierBuyer Not Found');
  }
  res.send(supplier);
});

const deleteSupplierBuyerByIdService = catchAsync(async (req, res) => {
  const supplier = await supplierBuyerService.deleteSupplierBuyerById(req.params.supplierBuyerId);
  res.status(httpStatus.NO_CONTENT).send();
});

module.exports = {
  createSupplierService,
  getAllSupplierBuyerService,
  getSupplierBuyerByIdService,
  updateSupplierBuyerByIdService,
  deleteSupplierBuyerByIdService,
  createSupplierBuyerwithType,
  getAllSupplierBuyerDeleteService,
};
