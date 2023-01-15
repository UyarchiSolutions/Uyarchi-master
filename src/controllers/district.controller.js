const httpStatus = require('http-status');
const pick = require('../utils/pick');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const DistrictService = require('../services/district.service');

const createDistrict = catchAsync(async (req, res) => {
  const district = await DistrictService.createDistrict(req.body);
  res.status(httpStatus.CREATED).send(district);
});

const getDistrictDetailsById = catchAsync(async (req, res) => {
  const district = await DistrictService.getDistrictById(req.params.districtId);
  if (!district || district.active === false) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Dsitrict_Details not found');
  }
  res.send(district);
});
const getAllDistrictDetails = catchAsync(async (req, res) => {
  const district = await DistrictService.getAllDistrict(req.params);
  if (!district) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Dsitrict_Details not found');
  }
  res.send(district);
});

const updateDistrict = catchAsync(async (req, res) => {
  const district = await DistrictService.updateDistrictById(req.params.districtId, req.body);
  res.send(district);
});

const deleteDistrict = catchAsync(async (req, res) => {
  await DistrictService.deleteDistrictById(req.params.districtId);
  res.status(httpStatus.NO_CONTENT).send();
});
module.exports = {
  createDistrict,
  getDistrictDetailsById,
  getAllDistrictDetails,
  updateDistrict,
  deleteDistrict,
};
