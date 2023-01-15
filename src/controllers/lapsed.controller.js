const httpStatus = require('http-status');
const pick = require('../utils/pick');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const lapsedService = require('../services/lapsed.service');

const createLapsed = catchAsync(async (req, res) => {
  const data = await lapsedService.createLapsedDetails(req.body);
  res.send(data);
});

module.exports = {
  createLapsed,
};
