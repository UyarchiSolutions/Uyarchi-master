const httpStatus = require('http-status');
const { sample } = require('../models');
const ApiError = require('../utils/ApiError');

const createSample = async (sampleBody) => {
  return sample.create(sampleBody);
};

module.exports = {
  createSample,
};
