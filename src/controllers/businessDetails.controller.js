const httpStatus = require('http-status');
const pick = require('../utils/pick');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const BusinessService = require('../services/businessDetails.service');

const createBusiness = catchAsync(async (req, res) => {
  const business = await BusinessService.createBusinessDetails(req.body);
  if (!business) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Business_Details Not Fount.');
  }
  res.status(httpStatus.CREATED).send(business);
});

const getBusinessDetails = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['salesProduct', 'shippingCost']);
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  const result = await BusinessService.queryBusiness(filter, options);
  res.send(result);
});

const getbusinessDetailsbyId = catchAsync(async (req, res) => {
  const business = await BusinessService.getBusinessById(req.params.businessId);
  if (!business || !business.active === true) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Business_Details not found');
  }
  res.send(business);
});

const updateBusiness = catchAsync(async (req, res) => {
  const business = await BusinessService.updateBusinessById(req.params.businessId, req.body);
  res.send(business);
});

const deletBusiness = catchAsync(async (req, res) => {
  await BusinessService.deleteBusinessById(req.params.businessId);
  res.status(httpStatus.NO_CONTENT).send();
});

module.exports = {
  createBusiness,
  getBusinessDetails,
  getbusinessDetailsbyId,
  updateBusiness,
  deletBusiness,
};
