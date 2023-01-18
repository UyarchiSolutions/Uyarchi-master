const httpStatus = require('http-status');
const SubHost = require('../models/subHost.model');
const ApiError = require('../utils/ApiError');
const moment = require('moment');

const createSubHost = async (body) => {
  const data = { ...body, ...{ created: moment() } };
  const values = await SubHost.create(data);
  return values;
};

module.exports = {
  createSubHost,
};
