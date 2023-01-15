const httpStatus = require('http-status');
const { SCVPurchase } = require('../models');
const ApiError = require('../utils/ApiError');

const createSCV = async (scvBody) => {
  return SCVPurchase.create(scvBody);
};

const getSCVById = async (id) => {
  const scv = SCVPurchase.findOne({ active: true });
  if (!scv) {
    throw new ApiError(httpStatus.NOT_FOUND, 'SCV Not Found');
  }
  return scv;
};
const getAllSCV = async () => {
  return SCVPurchase.find();
};

const querySCV = async (filter, options) => {
  return SCVPurchase.paginate(filter, options);
};

const updateSCVById = async (scvId, updateBody) => {
  let scv = await getSCVById(scvId);
  if (!scv) {
    throw new ApiError(httpStatus.NOT_FOUND, 'SCV not found');
  }
  scv = await SCVPurchase.findByIdAndUpdate({ _id: scvId }, updateBody, { new: true });
  return scv;
};

const deleteSCVById = async (scvId) => {
  const scv = await getSCVById(scvId);
  if (!scv) {
    throw new ApiError(httpStatus.NOT_FOUND, 'SCV not found');
  }
  (scv.active = false), (scv.archive = true), await scv.save();
  return scv;
};

module.exports = {
  createSCV,
  getAllSCV,
  getSCVById,
  updateSCVById,
  deleteSCVById,
};
