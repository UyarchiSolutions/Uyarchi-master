const httpStatus = require('http-status');
const SubHost = require('../models/subHost.model');
const ApiError = require('../utils/ApiError');
const moment = require('moment');

const createSubHost = async (body) => {
  const data = { ...body, ...{ created: moment() } };
  let exist = await SubHost.findOne({ phoneNumber: data.phoneNumber });
  if (exist) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Phone Number Already Exist');
  }
  const values = await SubHost.create(data);
  return values;
};

const getActiveSubHosts = async () => {
  let values = await SubHost.find({ active: true });
  return values;
};

module.exports = {
  createSubHost,
  getActiveSubHosts,
};
