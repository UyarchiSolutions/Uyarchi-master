const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');
const { SupplierBuyer } = require('../models');

const createSupplierBuyer = async (supplierBuyerBody) => {
  return SupplierBuyer.create(supplierBuyerBody);
};

const getAllSupplierBuyer = async () => {
  return SupplierBuyer.find({ active: true });
};

const createSupplierBuyerwithType = async (type) => {
  let values;
  if (type == 'Supplier') {
    values = await SupplierBuyer.find({ type: 'Supplier' });
  } else if (type == 'Buyer') {
    values = await SupplierBuyer.find({ type: 'Buyer' });
  } else if (type == 'Both') {
    values = await SupplierBuyer.find({ type: 'Both' });
  }
  return values;
};

const getAllSupplierBuyerDelete = async () => {
  return SupplierBuyer.find();
};

const getSupplierBuyerById = async (id) => {
  const supplier = SupplierBuyer.findById(id);
  if (!supplier) {
    throw new ApiError(httpStatus.NOT_FOUND, 'SupplierBuyer Not Found');
  }
  return supplier;
};

const updateSupplierBuyerById = async (supplierBuyerId, updateBody) => {
  let supplier = await getSupplierBuyerById(supplierBuyerId);
  if (!supplier) {
    throw new ApiError(httpStatus.NOT_FOUND, 'supplierBuyer not found');
  }
  supplier = await SupplierBuyer.findByIdAndUpdate({ _id: supplierBuyerId }, updateBody, { new: true });
  return supplier;
};

const deleteSupplierBuyerById = async (supplierBuyerId) => {
  const supplier = await getSupplierBuyerById(supplierBuyerId);
  if (!supplier) {
    throw new ApiError(httpStatus.NOT_FOUND, 'SupplierBuyer not found');
  }
  (supplier.active = false), (supplier.archive = true), await supplier.save();
  return supplier;
};

module.exports = {
  createSupplierBuyer,
  getAllSupplierBuyer,
  getSupplierBuyerById,
  createSupplierBuyerwithType,
  updateSupplierBuyerById,
  deleteSupplierBuyerById,
  getAllSupplierBuyerDelete,
};
