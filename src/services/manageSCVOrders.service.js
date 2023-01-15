const httpStatus = require('http-status');
const { ManageSCV } = require('../models');
const ApiError = require('../utils/ApiError');
const scvPurchase = require('../models/scv.Purchase.model');

const createManageScv = async (ManageSCVBody) => {
  const { ordersId } = ManageSCVBody;
  const ScvPurchase = await scvPurchase.findById(ordersId);
  if (ScvPurchase === null) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'SCV Purchase Not Found 😥');
  }
  return ManageSCV.create(ManageSCVBody);
};

const getManageScvOrdersById = async (id) => {
  return ManageSCV.findById(id);
};

const getAllManageSCVOrders = async () => {
  return ManageSCV.find();
};

const querManageSCVOrders = async (filter, options) => {
  return ManageSCV.paginate(filter, options);
};

const updateManageScvById = async (manageScvId, updateBody) => {
  let scv = await getManageScvOrdersById(manageScvId);
  if (!scv) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Manage SCV not found');
  }
  scv = await ManageSCV.findByIdAndUpdate({ _id: manageScvId }, updateBody, { new: true });
  return scv;
};

const deleteManageScvOrdersById = async (manageScvId) => {
  const scv = await getManageScvOrdersById(manageScvId);
  if (!scv) {
    throw new ApiError(httpStatus.NOT_FOUND, 'ManageSCV not found');
  }
  (scv.active = false), (scv.archive = true), await scv.save();
  return scv;
};

module.exports = {
  createManageScv,
  getAllManageSCVOrders,
  getManageScvOrdersById,
  updateManageScvById,
  deleteManageScvOrdersById,
  querManageSCVOrders,
};
