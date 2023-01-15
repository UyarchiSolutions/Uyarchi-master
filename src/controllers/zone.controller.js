const httpStatus = require('http-status');
const pick = require('../utils/pick');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const zoneModel = require('../models/zone.model');
const Ward = require('../models/ward.model');
const Street = require('../models/street.model');
const ZoneService = require('../services/zone.service');

const createZone = catchAsync(async (req, res) => {
  const zone = await ZoneService.createZone(req.body);
  res.status(httpStatus.CREATED).send(zone);
});

const getZones = catchAsync(async (req, res) => {});

// const wardPagination = catchAsync (async (req, res)=>{
//   const ward = await ZoneService.wardPagination(req.params.id);
//   res.send(ward);
// })

const getZoneDetailsById = catchAsync(async (req, res) => {
  const zone = await ZoneService.getZoneById(req.params.zoneId);
  if (!zone || zone.active === false) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Zone_Details not found');
  }
  res.send(zone);
});

const getZoneByDistrict = catchAsync(async (req, res) => {
  const dis = await ZoneService.getZoneByDistrict(req.params.districtId);
  res.send(dis);
});

const getAllZones = catchAsync(async (req, res) => {
  const zones = await ZoneService.getAllZone(req.params);
  if (!zones) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Zone Not Available ');
  }
  res.send(zones);
});

const zonePagination = catchAsync(async (req, res) => {
  const pagination = await ZoneService.zonePagination(req.params.id);
  res.send(pagination);
});

const updateZone = catchAsync(async (req, res) => {
  const zone = await ZoneService.updateZoneById(req.params.zoneId, req.body);
  res.send(zone);
});

const deleteZone = catchAsync(async (req, res) => {
  await ZoneService.deleteZoneById(req.params.zoneId);
  res.status(httpStatus.NO_CONTENT).send();
});

const getCounts_Street = catchAsync(async (req, res) => {
  const data = await ZoneService.getCounts_Street(req.body);
  res.send(data);
});
module.exports = {
  createZone,
  getAllZones,
  getZoneDetailsById,
  getZones,
  getZoneByDistrict,
  updateZone,
  deleteZone,
  zonePagination,
  getCounts_Street,
};
