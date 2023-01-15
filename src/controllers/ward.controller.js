const httpStatus = require('http-status');
const pick = require('../utils/pick');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const wardService = require('../services/ward.service');
const metaModel = require('../models/userMeta.model');

const createWard = catchAsync(async (req, res) => {
  const ward = await wardService.createWard(req.body);
  res.status(httpStatus.CREATED).send(ward);
});

const getAllWardsForManageTrends = catchAsync(async (req, res) => {
  const ward = await wardService.getAllWardsForManageTrends();
  res.send(ward);
});

// const getProducts = catchAsync(async (req, res) => {
//   const filter = pick(req.query, ['productTitle', 'unit']);
//   const options = pick(req.query, ['sortBy', 'limit', 'page']);
//   const result = await productService.queryProduct(filter, options);
//   res.send(result);
// });

const getWardByZoneId = catchAsync(async (req, res) => {
  const dis = await wardService.getWardByZoneId(req.params.zoneId);
  res.send(dis);
});

const getmetaData = catchAsync(async (req, res) => {
  let zoneId = await metaModel.findOne({ user_id: req.userId, metaKey: 'district' });
  if (!zoneId) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Zone Not FOund');
  }
  const dis = await wardService.getWardByZoneIdBySalesman(zoneId.metavalue);
  res.send(dis);
});

const getward = catchAsync(async (req, res) => {
  const ward = await wardService.getWardById(req.params.wardId);
  if (!ward || ward.active === false) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Ward not found');
  }
  res.send(ward);
});
const getAllWard = catchAsync(async (req, res) => {
  const allWard = await wardService.getAllWard(req.params);
  res.send(allWard);
});
const updateward = catchAsync(async (req, res) => {
  const ward = await wardService.updatewardById(req.params.wardId, req.body);
  res.send(ward);
});

const wardPagination = catchAsync(async (req, res) => {
  const ward = await wardService.wardPagination(req.params.id);
  res.send(ward);
});

const deleteWard = catchAsync(async (req, res) => {
  await wardService.deleteWardById(req.params.wardId);
  res.status(httpStatus.NO_CONTENT).send();
});

const createDummyStreet = catchAsync(async (req, res) => {
  const ward = await wardService.createDummyStreet();
  res.send(ward);
});

const getAll = catchAsync(async (req, res) => {
  const ward = await wardService.getAllWard();
  res.send(ward);
});

const wardParticularZoneData = catchAsync(async (req, res) => {
  const ward = await wardService.wardParticularZoneData(req.params.id, req.params.Uid);
  res.send(ward);
});

const wardParticularZoneData_only = catchAsync(async (req, res) => {
  const ward = await wardService.wardParticularZoneData_only(req.params.id);
  res.send(ward);
});

module.exports = {
  createWard,
  getAllWard,
  getward,
  getWardByZoneId,
  updateward,
  deleteWard,
  getAllWardsForManageTrends,
  wardPagination,
  getmetaData,
  createDummyStreet,
  getAll,
  wardParticularZoneData,
  wardParticularZoneData_only,
};
