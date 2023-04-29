const httpStatus = require('http-status');
const { SCVPurchase } = require('../models');
const ApiError = require('../utils/ApiError');

const { ScvCart } = require('../models/Scv.mode');

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

// Scv Partner Flow

const AddCart = async (body) => {
  let values = await ScvCart.create(body);
  return values;
};

const DisableCart = async (id) => {
  let values = await ScvCart.findById(id);
  if (!values) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Cart Nat Available');
  }
  values = await ScvCart.findByIdAndUpdate({ _id: id }, { active: false }, { new: true });
  return values;
};

const getScvCarts = async () => {
  let values = await ScvCart.find({ active: true });
  return values;
};

const updateSCVCart = async (id, body) => {
  let values = await ScvCart.findById(id);
  if (!values) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Cart Not Availbale');
  }
  values = await ScvCart.findByIdAndUpdate({ _id: id }, body, { new: true });
};

module.exports = {
  createSCV,
  getAllSCV,
  getSCVById,
  updateSCVById,
  deleteSCVById,
  AddCart,
  DisableCart,
  getScvCarts,
  updateSCVCart,
};
