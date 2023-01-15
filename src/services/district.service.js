const httpStatus = require('http-status');
const { District } = require('../models');
const ApiError = require('../utils/ApiError');

const createDistrict = async (districtBody) => {
  return District.create(districtBody);
};

const getAllDistrict = async () => {
  const district = District.find({ active: true });
  if (!district) {
    throw new ApiError(httpStatus.NOT_FOUND, 'District Not Found');
  }
  return district;
};

const getDistrictById = async (id) => {
  const district = District.findById(id);
  return district;
};

const queryDistrict = async (filter, options) => {
  return District.paginate(filter, options);
};

const updateDistrictById = async (districtId, updateBody) => {
  let district = await getDistrictById(districtId);
  if (!district) {
    throw new ApiError(httpStatus.NOT_FOUND, 'District not found');
  }
  district = await District.findByIdAndUpdate({ _id: districtId }, updateBody, { new: true });
  return district;
};

const deleteDistrictById = async (districtId) => {
  const district = await getDistrictById(districtId);
  if (!district) {
    throw new ApiError(httpStatus.NOT_FOUND, 'District not found');
  }
  (district.active = false), (district.archive = true), await district.save();
  return district;
};

module.exports = {
  createDistrict,
  getAllDistrict,
  getDistrictById,
  updateDistrictById,
  deleteDistrictById,
  queryDistrict,
};
