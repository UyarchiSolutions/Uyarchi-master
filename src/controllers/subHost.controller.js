const httpStatus = require('http-status');
const pick = require('../utils/pick');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const subHostService = require('../services/subHost.service');

const createSubHost = catchAsync(async (req, res) => {
  const data = await subHostService.createSubHost(req.body);
  res.send(data);
});

const getActiveSubHosts = catchAsync(async (req, res) => {
  const data = await subHostService.getActiveSubHosts();
  res.send(data);
});

module.exports = {
  createSubHost,
  getActiveSubHosts,
};
