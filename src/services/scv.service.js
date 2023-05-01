const httpStatus = require('http-status');
const { SCVPurchase } = require('../models');
const ApiError = require('../utils/ApiError');
const moment = require('moment');
const { ScvCart, Scv } = require('../models/Scv.mode');

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
  return values;
};

// Manage Scv Flow

const addScv = async (body) => {
  let values = await Scv.create(body);
  return values;
};

const updateSCVByPartner = async (id, body) => {
  let values = await Scv.findById(id);
  if (!values) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'scv Not Available');
  }
  values = await Scv.findByIdAndUpdate({ _id: id }, body, { new: true });
  return values;
};

const active_Inactive_Scv_ByPartner = async (id, body) => {
  const { type } = body;
  let values = await Scv.findById(id);
  if (!values) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'scv Not Available');
  }
  if (type == 'active') {
    values = await Scv.findByIdAndUpdate({ _id: id }, { active: true }, { new: true });
  } else {
    values = await Scv.findByIdAndUpdate({ _id: id }, { active: false }, { new: true });
  }
  return values;
};

const getAllScvByPartners = async () => {
  const values = await Scv.find();
  return values;
};

// Cart Allocation Flow

const getcarts_Allocation = async () => {
  const unAllocatedCart = await ScvCart.aggregate([
    {
      $match: {
        active: true,
      },
    },
  ]);
  return { unAllocatedCart: unAllocatedCart };
};

const getAvailable_Scv = async () => {
  const data = await Scv.aggregate([
    {
      $match: {
        workingStatus: { $in: ['no'] },
      },
    },
  ]);
  return data;
};

const AllocationScv_ToCart = async (body) => {
  const { scvId, cartId, scvName } = body;
  let getScv = await Scv.findById(scvId);
  let getCart = await ScvCart.findById(cartId);
  if (!getScv) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Scv Not Found');
  }
  if (!getCart) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Cart Not Found');
  }
  let allocateTime = moment().toDate();
  getCart = await ScvCart.findByIdAndUpdate(
    { _id: id },
    {
      closeStock: 'activated',
      allocatedScv: scvId,
      allocatedTime: allocateTime,
      allocationHistory: { $push: { scvId: scvId, scvName: scvName, date: allocateTime } },
    },
    { new: true }
  );
  getScv = await Scv.findByIdAndUpdate({ _id: scvId }, { workingStatus: 'yes' }, { new: true });
  return getCart;
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
  addScv,
  updateSCVByPartner,
  active_Inactive_Scv_ByPartner,
  getAllScvByPartners,
  getcarts_Allocation,
  getAvailable_Scv,
  AllocationScv_ToCart,
};
