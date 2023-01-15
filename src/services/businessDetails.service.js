const httpStatus = require('http-status');
const { Business } = require('../models');
const ApiError = require('../utils/ApiError');

const createBusinessDetails = async (businessBody) => {
  return Business.create(businessBody);
};

const getBusinessById = async (id) => {
  return Business.findById(id);
};

const queryBusiness = async (filter, options) => {
  return Business.paginate(filter, options);
};

const updateBusinessById = async (businessId, updateBody) => {
  let business = await getBusinessById(businessId);
  if (!business) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Business_Details not found');
  }
  business = await Business.findByIdAndUpdate({ _id: businessId }, updateBody, { new: true });
  return business;
};
const deleteBusinessById = async (businessId) => {
  const business = await getBusinessById(businessId);
  if (!business) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Business_Details not found');
  }
  (business.archive = true), (business.active = false), await business.save();
  return business;
};
module.exports = {
  createBusinessDetails,
  getBusinessById,
  queryBusiness,
  updateBusinessById,
  deleteBusinessById,
};
