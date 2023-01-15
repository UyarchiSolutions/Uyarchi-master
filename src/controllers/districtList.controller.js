const httpStatus = require('http-status');
const pick = require('../utils/pick');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const DistrictListService = require('../services/districtList.service');

const createDistrict = catchAsync(async (req, res) => {
  const dist = DistrictListService.createDistrict();
  res.send(dist);
});

const getAllDistrictList = catchAsync(async (req, res) => {
  const districtList = await DistrictListService.getAllDistrict();
  res.send(districtList);
});

module.exports = {
  getAllDistrictList,
  createDistrict,
};
