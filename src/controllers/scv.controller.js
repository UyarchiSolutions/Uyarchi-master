const httpStatus = require('http-status');
const pick = require('../utils/pick');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const scvService = require('../services/scv.service');
const { relativeTimeRounding } = require('moment');

const createSCV = catchAsync(async (req, res) => {
  const scv = await scvService.createSCV(req.body);
  if (!scv) {
    throw new ApiError(httpStatus.NOT_FOUND, ' SCV Not Fount.');
  }
  res.status(httpStatus.CREATED).send(scv);
});

// const getBusinessDetails = catchAsync(async (req, res) => {
//   const filter = pick(req.query, ['salesProduct', 'shippingCost']);
//   const options = pick(req.query, ['sortBy', 'limit', 'page']);
//   const result = await BusinessService.queryBusiness(filter, options);
//   res.send(result);
// });

const getSCVById = catchAsync(async (req, res) => {
  const scv = await scvService.getSCVById(req.params.scvId);
  if (!scv || scv.active === false) {
    throw new ApiError(httpStatus.NOT_FOUND, 'scv not found');
  }
  res.send(scv);
});

const gertAllSCV = catchAsync(async (req, res) => {
  const scv = await scvService.getAllSCV(req.params);
  if (!scv) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'SVC Not Found');
  }
  res.send(scv);
});

const updateSCV = catchAsync(async (req, res) => {
  const scv = await scvService.updateSCVById(req.params.scvId, req.body);
  res.send(scv);
});

const deletescv = catchAsync(async (req, res) => {
  await scvService.deleteSCVById(req.params.scvId);
  res.status(httpStatus.NO_CONTENT).send();
});

module.exports = {
  createSCV,
  getSCVById,
  gertAllSCV,
  updateSCV,
  deletescv,
};
