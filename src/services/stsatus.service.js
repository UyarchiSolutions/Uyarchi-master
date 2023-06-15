const httpStatus = require('http-status');
const { Street } = require('../models');
const Status = require('../models/status.model');
const ApiError = require('../utils/ApiError');
const moment = require('moment');

const createStatus = async (streetBody) => {
  let currentDate = moment().format('YYYY-MM-DD');
  let values = { ...streetBody, ...{ date: currentDate, createAt: moment() } };
  return Status.create(values);
};

const getStreetById = async (statusId) => {
  const status = await Status.findById(statusId);
  return status;
};

const getApprovedProductDateWise = async (date) => {
  return Status.aggregate([
    {
      $match: {
        $and: [{ date: { $eq: date } }],
      },
    },
    {
      $match: {
        $and: [{ status: { $eq: 'Approved' } }],
      },
    },
    {
      $lookup: {
        from: 'products',
        localField: 'productid',
        foreignField: '_id',
        as: 'productData',
      },
    },
    {
      $unwind: '$productData',
    },
    {
      $lookup: {
        from: 'suppliers',
        localField: 'productid',
        foreignField: 'productDealingWith',
        as: 'supplierData',
      },
    },
  ]);
};

const updatestatusById = async (statusId, updateBody) => {
  let status = await getStreetById(statusId);
  //console.log(status);
  if (!status) {
    throw new ApiError(httpStatus.NOT_FOUND, 'status not found');
  }
  status = await Status.findByIdAndUpdate({ _id: statusId }, updateBody, { new: true });
  return status;
};

const deletestatusById = async (statusId) => {
  const status = await getSupplierById(statusId);
  if (!status) {
    throw new ApiError(httpStatus.NOT_FOUND, 'status not found');
  }
  (status.active = false), (status.archive = true), await status.save();
  return status;
};

module.exports = {
  createStatus,
  getStreetById,
  getApprovedProductDateWise,
  deletestatusById,
  updatestatusById,
};
