const httpStatus = require('http-status');
const { DistrictList } = require('../models');
const ApiError = require('../utils/ApiError');

const createDistrict = async () => {
  const distList = [
    {
      state: 'Tamil Nadu',
      state1: 'Pondicherry',
    },
  ];
  //   return DistrictList.create(distList);
};

const getAllDistrict = async () => {
  return DistrictList.find();
};

const getStates = async () => {
  const state = await DistrictList.findById('f519cdfc-84d6-4a01-9930-22d26cece13e');
  return state;
};
module.exports = {
  getAllDistrict,
  createDistrict,
  getStates,
};
